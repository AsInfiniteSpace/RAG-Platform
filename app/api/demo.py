# app/api/demo.py
from fastapi import APIRouter, Depends, Request, Response, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.dependencies.demo_session import get_demo_session, check_demo_rate_limit
from app.services.retrieval_service import hybrid_search       # adjust import to your actual module
from app.services.generation_service import generate_answer  # adjust import to your actual module
from app.services.usage_service import log_usage                 # optional, see note below

from app.dependencies.demo_session import (
    get_demo_session,
    check_demo_rate_limit,
    check_demo_global_budget,
    record_demo_tokens,
)

router = APIRouter(prefix="/demo", tags=["demo"])

# +++++++  for local environment ++++++
# DEMO_OWNER_ID = '11c1c18b-770e-47d4-8f18-01addd21d026'        # the account id that owns the ingested demo document
# DEMO_DOCUMENT_ID = 'ab2ad751-dd15-43be-80bf-55f3e8835174'    # the demo document's id
# DEMO_TOP_K = 6

# +++++++  for production environment ++++++
DEMO_OWNER_ID = 'b7425b75-84c9-4918-9769-07dc11b7fb7d'        # user@user.com   the account id that owns the ingested demo document
DEMO_DOCUMENT_ID = '9a346fd7-e313-4881-a558-260c6b57ddbc'    # the demo document's id
DEMO_TOP_K = 6




class DemoChatRequest(BaseModel):
    question: str

@router.post("/chat")
def demo_chat(
    body: DemoChatRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_demo_session),
):
    check_demo_rate_limit(session_id)
    check_demo_global_budget()          # ← new: stop before spending

    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    results = hybrid_search(
        db, DEMO_OWNER_ID, body.question,
        document_type=None,
        top_k=DEMO_TOP_K,
        document_id=DEMO_DOCUMENT_ID,
    )
    chunks = [chunk for chunk, score in results]

    generated = generate_answer(body.question, chunks)

    tokens_used = generated.get("tokens_used", 0)
    if tokens_used:
        record_demo_tokens(tokens_used)          # ← track against the global pool
        log_usage(db, DEMO_OWNER_ID, "demo_chat", tokens_used, unit="tokens")

    sources = []
    for n in generated["citations_used"]:
        chunk = chunks[n - 1]
        sources.append({
            "excerpt_number": n,
            "filename": chunk.document.filename,
            "start_page": chunk.data_start_page or chunk.start_page,
            "end_page": chunk.data_end_page or chunk.end_page,
            "excerpt": chunk.content[:300],
        })

    # Optional: track demo token cost against the demo account, not a real user's quota
    log_usage(db, DEMO_OWNER_ID, "demo_chat", generated["tokens_used"], unit="tokens")

    return {
        "answer": generated["answer"],
        "sources": sources,
        "retrieved_chunks": [
            {
                "filename": c.document.filename,
                "excerpt": c.content[:300],
                "start_page": c.data_start_page or c.start_page,
                "end_page": c.data_end_page or c.end_page,
            }
            for c in chunks
        ],
    }