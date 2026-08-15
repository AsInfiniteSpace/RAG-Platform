from openai import OpenAI
from app.core.config import settings
from app.services.llm.base import LLMProvider


class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    def generate(self, messages: list[dict], temperature: float = 0, response_format: dict | None = None) -> dict:
        kwargs = {"model": "gpt-4o-mini", "messages": messages, "temperature": temperature}
        if response_format:
            kwargs["response_format"] = response_format
        response = self.client.chat.completions.create(**kwargs)
        return {"text": response.choices[0].message.content, "tokens_used": response.usage.total_tokens}