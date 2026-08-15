import uuid
from datetime import datetime
from pydantic import BaseModel
from enum import Enum


class DocumentResponse(BaseModel):
    id: uuid.UUID
    filename: str
    document_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
        

class DocumentType(str, Enum):
    invoice = "invoice"
    resume = "resume"
    contract = "contract"
    research_paper = "research_paper"
    general = "general"