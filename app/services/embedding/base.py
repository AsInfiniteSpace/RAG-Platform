from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_batch(self, texts: list[str]) -> tuple[list[list[float]], int]:
        """Returns (list of embedding vectors, tokens_used)"""
        ...

    @property
    @abstractmethod
    def dimensions(self) -> int:
        ...