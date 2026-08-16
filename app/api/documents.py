import os
import shutil
import uuid
import hashlib
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from sqlalchemy.orm import Session
from loguru import logger
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.core.redis import get_redis_pool
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.document_service import save_document
from app.schemas.document import DocumentType
from app.models.document_page import DocumentPage
from app.models.document_table import DocumentTable
from app.models.document_chunk import DocumentChunk
from app.models.eval_question import EvalQuestion, EvalExpectedChunk
from app.models.conversation import Conversation
from app.models.message import Message
from app.core.limiter import limiter
from app.services.usage_service import check_storage_quota, check_token_quota
from app.services.storage.factory import get_storage_provider



router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse)
@limiter.limit("10/minute")
async def upload_document(
    request: Request,
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_token_quota(db, current_user.id, current_user.tier)
    file_bytes = await file.read()
    check_storage_quota(db, current_user.id, current_user.tier, len(file_bytes))
    document = save_document(db, current_user.id, file.filename, file_bytes, document_type.value)

    pool = await get_redis_pool()
    await pool.enqueue_job("process_document", str(document.id))

    logger.info(f"Document uploaded by {current_user.email}: {file.filename} ({document_type})")
    return document

from fastapi import status
from pydantic import BaseModel

class BatchUploadResult(BaseModel):
    filename: str
    success: bool
    document_id: uuid.UUID | None = None
    error: str | None = None


@router.post("/upload-batch", response_model=list[BatchUploadResult])
async def upload_documents_batch(
    document_type: DocumentType = Form(...),
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = []
    pool = await get_redis_pool()

    for file in files:
        try:
            file_bytes = await file.read()
            document = save_document(db, current_user.id, file.filename, file_bytes, document_type.value)
            await pool.enqueue_job("process_document", str(document.id))
            results.append(BatchUploadResult(filename=file.filename, success=True, document_id=document.id))
            logger.info(f"Batch upload success by {current_user.email}: {file.filename}")
        except HTTPException as e:
            results.append(BatchUploadResult(filename=file.filename, success=False, error=e.detail))
            logger.warning(f"Batch upload failed for {file.filename}: {e.detail}")
        except Exception as e:
            results.append(BatchUploadResult(filename=file.filename, success=False, error=str(e)))
            logger.error(f"Batch upload failed for {file.filename}: {e}")

    return results

    
@router.get("", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Document).filter(Document.owner_id == current_user.id).all()


@router.delete("/{document_id}")
def delete_document(document_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    conversation_ids_subquery = db.query(Conversation.id).filter(Conversation.document_id == document_id).subquery()
    db.query(Message).filter(Message.conversation_id.in_(conversation_ids_subquery)).delete(synchronize_session=False)
    db.query(Conversation).filter(Conversation.document_id == document_id).delete(synchronize_session=False)

    chunk_ids_subquery = db.query(DocumentChunk.id).filter(DocumentChunk.document_id == document_id).subquery()

    eval_question_ids_subquery = db.query(EvalExpectedChunk.eval_question_id).filter(
        EvalExpectedChunk.chunk_id.in_(chunk_ids_subquery)
    ).subquery()

    db.query(EvalExpectedChunk).filter(EvalExpectedChunk.chunk_id.in_(chunk_ids_subquery)).delete(synchronize_session=False)
    db.query(EvalQuestion).filter(EvalQuestion.id.in_(eval_question_ids_subquery)).delete(synchronize_session=False)

    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.query(DocumentTable).filter(DocumentTable.document_id == document_id).delete()
    db.query(DocumentPage).filter(DocumentPage.document_id == document_id).delete()

    storage = get_storage_provider()
    storage.delete(document.file_path)

    db.delete(document)
    db.commit()
    logger.info(f"Document and all related data (including scoped conversations) deleted by {current_user.email}: {document.filename}")
    return {"message": "Document deleted"}

@router.post("/{document_id}/reindex")
async def reindex_document(document_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    conversation_ids_subquery = db.query(Conversation.id).filter(Conversation.document_id == document_id).subquery()
    db.query(Message).filter(Message.conversation_id.in_(conversation_ids_subquery)).delete(synchronize_session=False)
    db.query(Conversation).filter(Conversation.document_id == document_id).delete(synchronize_session=False)

    chunk_ids_subquery = db.query(DocumentChunk.id).filter(DocumentChunk.document_id == document_id).subquery()
    eval_question_ids_subquery = db.query(EvalExpectedChunk.eval_question_id).filter(
        EvalExpectedChunk.chunk_id.in_(chunk_ids_subquery)
    ).subquery()

    db.query(EvalExpectedChunk).filter(EvalExpectedChunk.chunk_id.in_(chunk_ids_subquery)).delete(synchronize_session=False)

    deleted_eval_count = db.query(EvalQuestion).filter(EvalQuestion.id.in_(eval_question_ids_subquery)).delete(synchronize_session=False)

    if deleted_eval_count:
        logger.warning(f"Reindexing {document.filename} removed {deleted_eval_count} eval question(s) tied to old chunks — these need to be re-added against the new chunks")

    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.query(DocumentTable).filter(DocumentTable.document_id == document_id).delete()
    db.query(DocumentPage).filter(DocumentPage.document_id == document_id).delete()

    document.status = "uploaded"
    db.commit()

    pool = await get_redis_pool()
    await pool.enqueue_job("process_document", str(document.id))

    logger.info(f"Reindex triggered by {current_user.email}: {document.filename}")
    return {"message": "Reindexing started", "document_id": document.id}