from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.retrieval import RetrievalQuery, RetrievedChunk
from app.services.retrieval_service import hybrid_search

router = APIRouter(prefix="/retrieve", tags=["retrieval"])


@router.post("", response_model=list[RetrievedChunk])
def retrieve(
    payload: RetrievalQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = hybrid_search(
        db, current_user.id, payload.query,
        document_type=payload.document_type.value if payload.document_type else None,
        document_id=payload.document_id,
        top_k=payload.top_k,
    )

    return [
        RetrievedChunk(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            filename=chunk.document.filename,
            content=chunk.content,
            chunk_type=chunk.chunk_type,
            start_page=chunk.start_page,
            end_page=chunk.end_page,
            data_start_page=chunk.data_start_page,
            data_end_page=chunk.data_end_page,
            score=score,
        )
        for chunk, score in results
    ]