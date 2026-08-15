import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship


class EvalQuestion(Base):
    __tablename__ = "eval_questions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expected_chunks = relationship("EvalExpectedChunk", cascade="all, delete-orphan")


class EvalExpectedChunk(Base):
    __tablename__ = "eval_expected_chunks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    eval_question_id = Column(UUID(as_uuid=True), ForeignKey("eval_questions.id"), nullable=False)
    chunk_id = Column(UUID(as_uuid=True), ForeignKey("document_chunks.id"), nullable=False)