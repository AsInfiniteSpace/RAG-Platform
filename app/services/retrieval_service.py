from sqlalchemy import text, func
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.embedding_service import generate_embedding
import uuid

import time
from app.schemas.retrieval_trace import RetrievalTrace

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

# Added OR fallback as keyword serach if previously AND logic retrun no results. Now less chances that keyword serach is returning empty results.
"""def keyword_search(db, owner_id, query, document_type=None, limit=20, document_id=None):
    def run(tsquery_expr):
        rank = func.ts_rank_cd(DocumentChunk.content_tsv, tsquery_expr)
        q = (
            db.query(DocumentChunk, rank.label("rank"))
            .join(Document)
            .filter(Document.owner_id == owner_id, DocumentChunk.content_tsv.op("@@")(tsquery_expr))
            .order_by(rank.desc())
        )
        if document_type:
            q = q.filter(Document.document_type == document_type)
        if document_id:
            q = q.filter(Document.id == document_id)
        return [chunk for chunk, _ in q.limit(limit).all()]

    and_tsquery = func.websearch_to_tsquery("english", query)
    results = run(and_tsquery)
    if results:
        return results   # strict AND already found something — trust it, it's the more precise signal

    or_tsquery = func.to_tsquery("english", func.replace(func.plainto_tsquery("english", query).cast(String), " & ", " | "))
    return run(or_tsquery)"""


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



"""def hybrid_search(db: Session, owner_id, query: str, document_type: str | None = None, top_k: int = 10, document_id: uuid.UUID | None = None):
    query_embedding, embed_tokens_used = generate_embedding(query)
    log_usage(db, owner_id, "retrieval - embedding", embed_tokens_used, unit="tokens")

    vector_results = vector_search(db, owner_id, query_embedding, document_type, limit=20, document_id=document_id)
    keyword_results = keyword_search(db, owner_id, query, document_type, limit=20, document_id=document_id)

    fused = reciprocal_rank_fusion(vector_results, keyword_results)
    candidate_chunks = [chunk for chunk, score in fused[:20]]  # narrow candidate set for the reranker

    reranker = get_reranker()
    reranked, search_units_used = reranker.rerank(query, candidate_chunks, top_n=top_k)
    log_usage(db, owner_id, "retrieval - reranking", search_units_used, unit="search_units")

    return reranked"""

def hybrid_search(
    db: Session,
    owner_id,
    query: str,
    document_type: str | None = None,
    top_k: int = 10,
    document_id: uuid.UUID | None = None,
):
    trace_id = str(uuid.uuid4())

    # ---------------------------------------------------------
    # Query embedding
    # ---------------------------------------------------------
    
    query = query.strip()

    query_embedding, embed_tokens_used = generate_embedding(query)

    log_usage(
        db,
        owner_id,
        "retrieval - embedding",
        embed_tokens_used,
        unit="tokens",
    )

    # ---------------------------------------------------------
    # Vector search
    # ---------------------------------------------------------

    vector_start = time.perf_counter()

    vector_results = vector_search(
        db,
        owner_id,
        query_embedding,
        document_type,
        limit=20,
        document_id=document_id,
    )

    vector_ms = (
        time.perf_counter() - vector_start
    ) * 1000

    # ---------------------------------------------------------
    # Keyword search
    # ---------------------------------------------------------

    keyword_start = time.perf_counter()

    keyword_results = keyword_search(
        db,
        owner_id,
        query,
        document_type,
        limit=20,
        document_id=document_id,
    )

    keyword_ms = (
        time.perf_counter() - keyword_start
    ) * 1000

    # ---------------------------------------------------------
    # Reciprocal Rank Fusion
    # ---------------------------------------------------------

    rrf_start = time.perf_counter()

    fused = reciprocal_rank_fusion(
        vector_results,
        keyword_results,
    )

    rrf_ms = (
        time.perf_counter() - rrf_start
    ) * 1000

    # ---------------------------------------------------------
    # Candidate chunks for reranking
    # ---------------------------------------------------------

    candidate_chunks = [
        chunk
        for chunk, score in fused[:20]
    ]

    # ---------------------------------------------------------
    # Reranking
    # ---------------------------------------------------------

    rerank_start = time.perf_counter()

    reranker = get_reranker()

    reranked, search_units_used = reranker.rerank(
        query,
        candidate_chunks,
        top_n=top_k,
    )

    rerank_ms = (
        time.perf_counter() - rerank_start
    ) * 1000

    log_usage(
        db,
        owner_id,
        "retrieval - reranking",
        search_units_used,
        unit="search_units",
    )

    # ---------------------------------------------------------
    # Retrieval trace
    # ---------------------------------------------------------

    trace = RetrievalTrace(
        trace_id=trace_id,
        user_id=str(owner_id),
        query=query,

        vector_results=[
            {
                "chunk_id": str(chunk.id),
                "rank": rank,
            }
            for rank, chunk
            in enumerate(vector_results, start=1)
        ],

        keyword_results=[
            {
                "chunk_id": str(chunk.id),
                "rank": rank,
            }
            for rank, chunk
            in enumerate(keyword_results, start=1)
        ],

        rrf_results=[
            {
                "chunk_id": str(chunk.id),
                "rank": rank,
                "score": score,
            }
            for rank, (chunk, score)
            in enumerate(fused, start=1)
        ],

        reranked_results=[
            {
                "chunk_id": str(chunk.id),
                "rank": rank,
                "score": score,
            }
            for rank, (chunk, score)
            in enumerate(reranked, start=1)
        ],

        vector_ms=vector_ms,
        keyword_ms=keyword_ms,
        rrf_ms=rrf_ms,
        rerank_ms=rerank_ms,
    )

    # print("\n========== RETRIEVAL TRACE ==========")
    # print(trace.model_dump_json(indent=2))
    # print("=====================================\n")

    return reranked
    