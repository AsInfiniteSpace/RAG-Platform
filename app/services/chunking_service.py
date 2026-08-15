import tiktoken
from loguru import logger

encoding = tiktoken.get_encoding("cl100k_base")  # tokenizer used by OpenAI's embedding models


def chunk_text(text: str, page_number: int, max_tokens: int = 400, overlap_tokens: int = 50) -> list[dict]:
    tokens = encoding.encode(text)
    chunks = []
    start = 0

    while start < len(tokens):
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text_value = encoding.decode(chunk_tokens)
        chunks.append({
            "page_number": page_number,
            "content": chunk_text_value,
            "chunk_type": "text",
        })
        if end == len(tokens):
            break
        start = end - overlap_tokens  # step back so chunks overlap slightly

    return chunks


def chunk_table(tagged_rows: list[dict], max_tokens: int = 400) -> list[dict]:
    if not tagged_rows:
        return []

    header_row = tagged_rows[0]
    header_tokens = len(encoding.encode(" | ".join(str(c) for c in header_row["row"])))

    chunks = []
    current = [header_row]
    current_tokens = header_tokens

    for tagged_row in tagged_rows[1:]:
        row_tokens = len(encoding.encode(" | ".join(str(c) for c in tagged_row["row"])))
        if current_tokens + row_tokens > max_tokens and len(current) > 1:
            chunks.append(current)
            current = [header_row]
            current_tokens = header_tokens
        current.append(tagged_row)
        current_tokens += row_tokens

    if len(current) > 1:
        chunks.append(current)

    result = []
    for rows in chunks:
        all_pages = [r["page"] for r in rows]
        data_pages = [r["page"] for r in rows[1:]]  # skip header (index 0)
        result.append({
            "start_page": min(all_pages),
            "end_page": max(all_pages),
            "data_start_page": min(data_pages) if data_pages else min(all_pages),
            "data_end_page": max(data_pages) if data_pages else max(all_pages),
            "content": "\n".join(" | ".join(str(c) for c in r["row"]) for r in rows),
            "chunk_type": "table",
        })
    return result