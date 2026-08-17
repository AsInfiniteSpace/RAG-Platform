from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.eval_question import EvalQuestion, EvalExpectedChunk
from app.schemas.eval import EvalQuestionCreate, EvalRunResult, EvalQuestionResponse
from app.services.eval_service import run_evaluation
import uuid
from app.core.limiter import limiter
from app.services.usage_service import check_token_quota, log_usage


router = APIRouter(prefix="/eval", tags=["evaluation"])


@router.post("/questions", response_model=EvalQuestionResponse)
def add_eval_question(
    payload: EvalQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    eq = EvalQuestion(owner_id=current_user.id, question=payload.question)
    eq.expected_chunks = [EvalExpectedChunk(chunk_id=cid) for cid in payload.expected_chunk_ids]
    db.add(eq)
    db.commit()
    db.refresh(eq)
    return EvalQuestionResponse(
        id=eq.id,
        question=eq.question,
        expected_chunk_ids=payload.expected_chunk_ids,
    )

@router.get("/questions")
def list_eval_questions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = (
        db.query(EvalQuestion)
        .filter(EvalQuestion.owner_id == current_user.id)
        .order_by(EvalQuestion.created_at.desc())
        .all()
    )

    return [
        {
            "id": question.id,
            "question": question.question,
            "expected_chunk_ids": [
                expected.chunk_id
                for expected in question.expected_chunks
            ],
        }
        for question in questions
    ]

@router.post("/run", response_model=EvalRunResult)
@limiter.limit("10/minute")
def run_eval(
    request: Request,
    top_k: int = 8,
    question_id: uuid.UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_token_quota(db, current_user.id, current_user.tier)
    eval_result = run_evaluation(db, current_user.id, top_k=top_k, question_id=question_id)
   
    return eval_result
