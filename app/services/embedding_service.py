from loguru import logger
from app.core.config import settings
from app.services.embedding.factory import get_embedding_provider

def generate_embedding(text: str) -> list[float]:
    provider = get_embedding_provider()
    return provider.embed_query(text)

def generate_embeddings_batch(texts: list[str]) -> tuple[list[list[float]], int]:
    provider = get_embedding_provider()
    return provider.embed_batch(texts)