import uuid
from pydantic import BaseModel


class EvalQuestionCreate(BaseModel):
    question: str
    expected_chunk_ids: list[uuid.UUID]

class CitedSource(BaseModel):
    excerpt_number: int
    chunk_id: uuid.UUID
    content: str

class EvalQuestionResult(BaseModel):
    question: str
    expected_chunk_ids: list[uuid.UUID]
    all_found: bool
    fraction_found: float
    found_chunk_ids: list[uuid.UUID] = []
    ranks: list[int] = [] 
    generated_answer: str | None = None
    faithful: bool | None = None
    unsupported_claims: list[str] = []
    cited_sources: list[CitedSource] = []


class EvalRunResult(BaseModel):
    total_questions: int
    hit_rate: float       # % where the expected chunk appeared anywhere in results
    mean_reciprocal_rank: float  # rewards finding it near the top, not just somewhere
    faithfulness_rate: float
    details: list[EvalQuestionResult]

class EvalQuestionResponse(BaseModel):
    id: uuid.UUID
    question: str
    expected_chunk_ids: list[uuid.UUID]
