import uuid
from pydantic import BaseModel
from app.schemas.document import DocumentType


class Source(BaseModel):
    excerpt_number: int
    filename: str
    start_page: int
    end_page: int
    excerpt: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    conversation_id: uuid.UUID

class ChatQuery(BaseModel):
    query: str
    conversation_id: uuid.UUID | None = None  # None = start a new conversation
    document_type: DocumentType | None = None
    document_id: uuid.UUID | None = None
    top_k: int = 5