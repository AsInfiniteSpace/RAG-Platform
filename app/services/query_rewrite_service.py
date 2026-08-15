from loguru import logger
from app.core.config import settings
from app.services.llm.factory import get_llm_provider

llm = get_llm_provider()

REWRITE_SYSTEM_PROMPT = """Given a conversation history and a new follow-up question, rewrite the follow-up into a standalone question that can be understood without the prior context.
If the follow-up is already standalone (doesn't depend on prior context), return it exactly unchanged.
Only output the rewritten question — nothing else, no explanation."""


def rewrite_query(history: list[dict], new_query: str) -> tuple[str, int]:
    if not history:
        return new_query, 0  # nothing to resolve against, skip the API call entirely

    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history)

    messages=[
        {"role": "system", "content": REWRITE_SYSTEM_PROMPT},
        {"role": "user", "content": f"Conversation history:\n{history_text}\n\nFollow-up question: {new_query}\n\nStandalone question:"},
    ]

    result = llm.generate(messages=messages, temperature=0)
    rewritten = result["text"].strip()
    tokens_used = result["tokens_used"]


    if rewritten != new_query:
        logger.info(f"Query rewritten: '{new_query}' -> '{rewritten}'")
    return rewritten, tokens_used