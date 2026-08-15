from sqlalchemy.orm import Session
from app.models.request_log import RequestLog


def log_request(db: Session, owner_id, endpoint: str, status_code: int, duration_ms: int,
                 query: str = None, retrieved_chunk_ids: list = None, cited_chunk_ids: list = None):
    log = RequestLog(
        owner_id=owner_id,
        endpoint=endpoint,
        query=query,
        retrieved_chunk_ids=[str(c) for c in retrieved_chunk_ids] if retrieved_chunk_ids else None,
        cited_chunk_ids=[str(c) for c in cited_chunk_ids] if cited_chunk_ids else None,
        duration_ms=duration_ms,
        status_code=status_code,
    )
    db.add(log)
    db.commit()