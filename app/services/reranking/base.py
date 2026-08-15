from abc import ABC, abstractmethod


class RerankerProvider(ABC):
    @abstractmethod
    def rerank(self, query: str, chunks: list, top_n: int = 10) -> tuple[list, int]:
        """Returns (list of (chunk, score) tuples, search_units_consumed)"""
        ...