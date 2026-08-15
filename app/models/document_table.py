import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


"""class DocumentTable(Base):
    __tablename__ = "document_tables"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    table_data = Column(JSONB, nullable=False)  # list of rows, each row a list of cell values
    created_at = Column(DateTime, default=datetime.utcnow)"""

class DocumentTable(Base):
    __tablename__ = "document_tables"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    start_page = Column(Integer, nullable=False)
    end_page = Column(Integer, nullable=False)
    table_data = Column(JSONB, nullable=False)  # list of rows, each row a list of cell values
    created_at = Column(DateTime, default=datetime.utcnow)