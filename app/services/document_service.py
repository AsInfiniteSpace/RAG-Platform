import uuid
import hashlib
from sqlalchemy.orm import Session
from loguru import logger
from fastapi import HTTPException
from app.core.config import settings
from app.models.document import Document
from app.services.storage.factory import get_storage_provider


def save_document(db: Session, owner_id, filename: str, file_bytes: bytes, document_type: str) -> Document:
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    existing = db.query(Document).filter(
        Document.owner_id == owner_id,
        Document.file_hash == file_hash,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Already uploaded as '{existing.filename}' (status: {existing.status})")

    document_id = uuid.uuid4()
    storage_key = f"{owner_id}/{document_id}_{filename}"

    storage = get_storage_provider()
    storage.save(storage_key, file_bytes)

    try:
        document = Document(
            id=document_id,
            owner_id=owner_id,
            filename=filename,
            file_path=storage_key,
            file_hash=file_hash,
            document_type=document_type,
            file_size_bytes=len(file_bytes),
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document
    except Exception:
        storage.delete(storage_key)
        logger.error(f"Failed to save document record, removed orphaned file: {storage_key}")
        raise