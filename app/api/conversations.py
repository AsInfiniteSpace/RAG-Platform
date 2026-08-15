from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationResponse, ConversationDetail
from app.schemas.document import DocumentType
from app.models.message import Message
import uuid

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    document_type: DocumentType | None = Query(None),
    document_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Conversation).filter(
        Conversation.owner_id == current_user.id
    )

    if document_type:
        query = query.filter(
            Conversation.document_type == document_type.value
        )

    if document_id:
        query = query.filter(
            Conversation.document_id == document_id
        )

    return query.order_by(
        Conversation.created_at.desc()
    ).all()


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.owner_id == current_user.id,
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.owner_id == current_user.id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    # Delete all messages belonging to the conversation
    db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).delete(
        synchronize_session=False
    )

    # Delete the conversation itself
    db.delete(conversation)

    db.commit()

    return {
        "message": "Conversation deleted successfully"
    }