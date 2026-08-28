from pydantic import BaseModel
from typing import Any



class RetrievalTrace(BaseModel):
    trace_id: str
    user_id: str
    query: str

    vector_results: list[dict[str, Any]]
    keyword_results: list[dict[str, Any]]
    rrf_results: list[dict[str, Any]]
    reranked_results: list[dict[str, Any]]

    vector_ms: float = 0
    keyword_ms: float = 0
    rrf_ms: float = 0
    rerank_ms: float = 0