import uuid
from pydantic import BaseModel
from app.schemas.document import DocumentType


class RetrievalQuery(BaseModel):
    query: str
    document_type: DocumentType | None = None
    document_id: uuid.UUID | None = None
    top_k: int = 10


class RetrievedChunk(BaseModel):
    chunk_id: uuid.UUID
    document_id: uuid.UUID
    filename: str
    content: str
    chunk_type: str
    start_page: int
    end_page: int
    data_start_page: int | None = None
    data_end_page: int | None = None
    score: float