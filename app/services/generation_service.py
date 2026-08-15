import re

from loguru import logger
from app.core.config import settings
from app.services.llm.factory import get_llm_provider

llm = get_llm_provider()

SYSTEM_PROMPT = """You are a document assistant. Answer the user's question using ONLY the numbered excerpts provided below.

Rules:
- Every factual claim must include a citation in square brackets referencing the excerpt number, e.g. [1] or [2][3].
- If the answer is not found in the excerpts, respond exactly: "I don't have information about this in the provided documents." Do not guess or use outside knowledge.
- Be concise and direct."""


def build_context(chunks: list) -> str:
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        start = chunk.data_start_page or chunk.start_page
        end = chunk.data_end_page or chunk.end_page
        parts.append(f"[{i}] (source: {chunk.document.filename}, page {start}-{end})\n{chunk.content}")
    return "\n\n".join(parts)


def generate_answer(query: str, chunks: list, context: str | None = None) -> dict:
    if not chunks:
        return {"answer": "I don't have information about this in the provided documents.", "citations_used": []}

    if context is None:
        context = build_context(chunks)

    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
    ]
    result = llm.generate(messages=messages, temperature=0)
    answer = result["text"]
    tokens_used = result["tokens_used"]

    cited_numbers = sorted(set(int(n) for n in re.findall(r"\[(\d+)\]", answer)))
    valid_numbers = [n for n in cited_numbers if 1 <= n <= len(chunks)]

    return {"answer": answer, "citations_used": valid_numbers, "tokens_used": tokens_used}