import cohere
from app.core.config import settings
from app.services.reranking.base import RerankerProvider


class CohereProvider(RerankerProvider):
    def __init__(self):
        self.client = cohere.Client(settings.cohere_api_key)

    def rerank(self, query, chunks, top_n=10):
        if not chunks:
            return [], 0
        documents = [chunk.content for chunk in chunks]
        response = self.client.rerank(model="rerank-english-v3.0", query=query, documents=documents, top_n=min(top_n, len(documents)))
        search_units_used = response.meta.billed_units.search_units if response.meta else 1
        reranked = [(chunks[r.index], r.relevance_score) for r in response.results]
        return reranked, search_units_used