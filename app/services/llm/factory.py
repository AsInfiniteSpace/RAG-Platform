from app.core.config import settings
from app.services.llm.openai_provider import OpenAIProvider

_provider = None

def get_llm_provider():
    global _provider
    if _provider is None:
        if settings.llm_provider == "openai":
            _provider = OpenAIProvider()
        else:
            raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")
    return _provider