import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    operation = Column(String, nullable=False)  # "embedding", "generation", "rerank", "query_rewrite"
    units_consumed = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    unit = Column(String, nullable=False, default="tokens")  # "tokens" or "search_units"