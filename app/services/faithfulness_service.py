import json
from loguru import logger
from app.core.config import settings
from app.services.llm.factory import get_llm_provider

llm = get_llm_provider()

FAITHFULNESS_PROMPT = """You are a strict fact-checker. Given numbered source excerpts and an answer that cites them, check whether EVERY factual claim in the answer is genuinely supported by its cited excerpt(s).

Some excerpts contain pipe-delimited tables. When checking a numeric claim against a table:
1. Find the correct row by matching the identifying value (e.g. part number, item number).
2. Identify the correct COLUMN by its header name — do not use the first nearby number you see. A row often has several numeric columns (e.g. "Qty per A/C" vs "Fleet Spares"); match the claim to the column whose header actually matches what's being claimed.
3. State explicitly, for each claim, which excerpt, row, and column you checked, before deciding.

Respond with ONLY valid JSON, in exactly this key order:
{"reasoning": "step-by-step check for each claim, naming excerpt/row/column", "faithful": true or false, "unsupported_claims": ["claim text", ...]}"""


def evaluate_faithfulness(answer: str, context: str) -> tuple[dict, int]:
    
    messages=[
        {"role": "system", "content": FAITHFULNESS_PROMPT},
        {"role": "user", "content": f"Sources:\n{context}\n\nAnswer:\n{answer}"},
    ]

    result = llm.generate(messages=messages, temperature=0, response_format={"type": "json_object"})
    faithful_data = result["text"]
    tokens_used = result["tokens_used"]

    try:
        return json.loads(faithful_data), tokens_used
    except json.JSONDecodeError:
        logger.error("Faithfulness judge returned invalid JSON")
        return {"faithful": None, "unsupported_claims": [], "reasoning": "judge output could not be parsed"}