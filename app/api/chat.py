from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.chat import ChatQuery, ChatResponse, Source
from app.services.retrieval_service import hybrid_search
from app.services.generation_service import generate_answer
import uuid
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.query_rewrite_service import rewrite_query
from app.models.document import Document
import time
from app.services.observability_service import log_request
from app.core.limiter import limiter
from app.services.usage_service import check_token_quota, check_search_unit_quota, log_usage

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(
    request: Request,
    payload: ChatQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_token_quota(db, current_user.id, current_user.tier)
    check_search_unit_quota(db, current_user.id, current_user.tier)
    start = time.time()
    if payload.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == payload.conversation_id,
            Conversation.owner_id == current_user.id,
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        if payload.document_id:
            owned_doc = db.query(Document).filter(
                Document.id == payload.document_id,
                Document.owner_id == current_user.id,
            ).first()
            if not owned_doc:
                raise HTTPException(status_code=404, detail="Document not found")

        conversation = Conversation(owner_id=current_user.id, title=payload.query[:60], document_type=(payload.document_type.value if payload.document_type else None), document_id=payload.document_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    recent_messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.desc()).limit(6).all()
    recent_messages.reverse()
    history = [{"role": m.role, "content": m.content} for m in recent_messages]

    
    search_query, token_used_for_query_rewrite = rewrite_query(history, payload.query)
    log_usage(db, current_user.id, "query_rewriting", token_used_for_query_rewrite, unit="tokens")

    db.add(Message(conversation_id=conversation.id, role="user", content=payload.query))

    results = hybrid_search(
        db, current_user.id, search_query,
        document_type=payload.document_type.value if payload.document_type else None,
        top_k=payload.top_k,
        document_id=payload.document_id,
    )
    
   
    chunks = [chunk for chunk, score in results]

    check_token_quota(db, current_user.id, current_user.tier)
    generated = generate_answer(search_query, chunks)

    sources = []
    for n in generated["citations_used"]:
        chunk = chunks[n - 1]
        sources.append({
            "excerpt_number": n,
            "filename": chunk.document.filename,
            "start_page": chunk.data_start_page or chunk.start_page,
            "end_page": chunk.data_end_page or chunk.end_page,
            "excerpt": chunk.content[:300],
        })
    
    log_usage(db, current_user.id, "chat - generation", generated["tokens_used"], unit="tokens")

    db.add(Message(conversation_id=conversation.id, role="assistant", content=generated["answer"], sources=sources))
    db.commit()

    duration_ms = int((time.time() - start) * 1000)
    log_request(
        db, current_user.id, "chat", 200, duration_ms,
        query=payload.query,
        retrieved_chunk_ids=[c.id for c in chunks],
        cited_chunk_ids=[chunks[n - 1].id for n in generated["citations_used"]],
    )
   
    

    return ChatResponse(answer=generated["answer"], sources=sources, conversation_id=conversation.id)