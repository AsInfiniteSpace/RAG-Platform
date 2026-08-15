import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    endpoint = Column(String, nullable=False)
    query = Column(String, nullable=True)
    retrieved_chunk_ids = Column(JSONB, nullable=True)
    cited_chunk_ids = Column(JSONB, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    status_code = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)