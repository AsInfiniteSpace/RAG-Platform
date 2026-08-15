import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base



class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_hash = Column(String, nullable=False, index=True)
    document_type = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    status = Column(String, default="uploaded")  # uploaded, processing, ready, failed
    created_at = Column(DateTime, default=datetime.utcnow)       
    __table_args__ = (
        Index("ix_documents_owner_type", "owner_id", "document_type"),        
    )