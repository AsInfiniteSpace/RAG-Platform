import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Computed
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    start_page = Column(Integer, nullable=False)
    end_page = Column(Integer, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    chunk_type = Column(String, default="text")
    created_at = Column(DateTime, default=datetime.utcnow)
    data_start_page = Column(Integer, nullable=True)
    data_end_page = Column(Integer, nullable=True)
    embedding = Column(Vector(1536), nullable=True)  # 1536 = OpenAI text-embedding-3-small's dimension size
    document = relationship("Document")
    content_tsv = Column(TSVECTOR, Computed("to_tsvector('english', content)", persisted=True))
    __table_args__ = (
        Index("ix_chunks_content_tsv", "content_tsv", postgresql_using="gin"),
    )