from openai import OpenAI
from app.core.config import settings
from app.services.embedding.base import EmbeddingProvider


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    def embed_batch(self, texts):
        response = self.client.embeddings.create(model="text-embedding-3-small", input=texts)
        return [item.embedding for item in response.data], response.usage.total_tokens
        
    def embed_query(self, text):
        response = self.client.embeddings.create(model="text-embedding-3-small", input=text)
        return response.data[0].embedding, response.usage.total_tokens

    @property
    def dimensions(self) -> int:
        return 1536