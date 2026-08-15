from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, messages: list[dict], temperature: float = 0, response_format: dict | None = None) -> dict:
        """Returns {"text": str, "tokens_used": int}"""
        ...