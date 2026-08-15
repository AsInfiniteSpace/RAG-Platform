import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)