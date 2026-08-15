from app.core.config import settings
from app.services.reranking.cohere_provider import CohereProvider

_reranker = None

def get_reranker():
    global _reranker
    if _reranker is None:
        if settings.reranker_provider == "cohere":
            _reranker = CohereProvider()
        else:
            raise ValueError(f"Unknown reranker provider: {settings.reranker_provider}")
    return _reranker