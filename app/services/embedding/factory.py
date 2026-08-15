from app.core.config import settings
from app.services.embedding.openai_provider import OpenAIEmbeddingProvider

_provider = None

def get_embedding_provider():
    global _provider
    if _provider is None:
        if settings.embedding_provider == "openai":
            _provider = OpenAIEmbeddingProvider()
        else:
            raise ValueError(f"Unknown embedding provider: {settings.embedding_provider}")
    return _provider