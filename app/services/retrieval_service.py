from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.embedding_service import generate_embedding
import uuid
from app.services.reranking.factory import get_reranker
from app.services.usage_service import log_usage


def vector_search(db: Session, owner_id, query_embedding: list[float], document_type: str | None, limit: int, document_id: uuid.UUID | None = None):
    q = db.query(DocumentChunk).join(Document).filter(Document.owner_id == owner_id)
    if document_type:
        q = q.filter(Document.document_type == document_type)
    if document_id:
        q = q.filter(Document.id == document_id)
    return q.order_by(DocumentChunk.embedding.cosine_distance(query_embedding)).limit(limit).all()


def keyword_search(db: Session, owner_id, query: str, document_type: str | None, limit: int, document_id: uuid.UUID | None = None):
    q = db.query(DocumentChunk).join(Document).filter(
        Document.owner_id == owner_id,
        DocumentChunk.content_tsv.op("@@")(text("websearch_to_tsquery('english', :query)")),
    ).params(query=query)
    if document_type:
        q = q.filter(Document.document_type == document_type)
    if document_id:
        q = q.filter(Document.id == document_id)
    return q.limit(limit).all()


def reciprocal_rank_fusion(vector_results: list, keyword_results: list, k: int = 60) -> list[tuple]:
    scores = {}
    chunks_by_id = {}

    for rank, chunk in enumerate(vector_results):
        scores[chunk.id] = scores.get(chunk.id, 0) + 1 / (k + rank + 1)
        chunks_by_id[chunk.id] = chunk

    for rank, chunk in enumerate(keyword_results):
        scores[chunk.id] = scores.get(chunk.id, 0) + 1 / (k + rank + 1)
        chunks_by_id[chunk.id] = chunk

    ranked_ids = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [(chunks_by_id[chunk_id], score) for chunk_id, score in ranked_ids]



def hybrid_search(db: Session, owner_id, query: str, document_type: str | None = None, top_k: int = 10, document_id: uuid.UUID | None = None):
    query_embedding, embed_tokens_used = generate_embedding(query)
    log_usage(db, owner_id, "retrieval - embedding", embed_tokens_used, unit="tokens")

    vector_results = vector_search(db, owner_id, query_embedding, document_type, limit=20, document_id=document_id)
    keyword_results = keyword_search(db, owner_id, query, document_type, limit=20, document_id=document_id)

    fused = reciprocal_rank_fusion(vector_results, keyword_results)
    candidate_chunks = [chunk for chunk, score in fused[:20]]  # narrow candidate set for the reranker

    reranker = get_reranker()
    reranked, search_units_used = reranker.rerank(query, candidate_chunks, top_n=top_k)
    log_usage(db, owner_id, "retrieval - reranking", search_units_used, unit="search_units")

    return reranked
    