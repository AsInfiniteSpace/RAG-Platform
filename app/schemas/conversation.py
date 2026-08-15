import uuid
from datetime import datetime
from pydantic import BaseModel
from app.schemas.chat import Source


class MessageResponse(BaseModel):
    role: str
    content: str
    sources: list[Source] | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    document_type: str | None = None
    document_id: uuid.UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(ConversationResponse):
    messages: list[MessageResponse]