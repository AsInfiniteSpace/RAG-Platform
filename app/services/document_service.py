import os
import uuid
import hashlib
from sqlalchemy.orm import Session
from loguru import logger
from fastapi import HTTPException
from app.core.config import settings
from app.models.document import Document


def save_document(db: Session, owner_id, filename: str, file_bytes: bytes, document_type: str) -> Document:
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    existing = db.query(Document).filter(
        Document.owner_id == owner_id,
        Document.file_hash == file_hash,
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Already uploaded as '{existing.filename}' (status: {existing.status})",
        )

    user_folder = os.path.join(settings.storage_path, str(owner_id))
    os.makedirs(user_folder, exist_ok=True)

    document_id = uuid.uuid4()
    file_path = os.path.join(user_folder, f"{document_id}_{filename}")

    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    try:
        document = Document(
            id=document_id,
            owner_id=owner_id,
            filename=filename,
            file_path=file_path,
            file_hash=file_hash,
            document_type=document_type,
            file_size_bytes=len(file_bytes),
            status="uploaded",
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document
    except Exception:
        os.remove(file_path)
        logger.error(f"Failed to save document record, removed orphaned file: {file_path}")
        raise