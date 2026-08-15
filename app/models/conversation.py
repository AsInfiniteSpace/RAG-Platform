import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="New Conversation")
    document_type = Column(String, nullable=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", order_by="Message.created_at")
    