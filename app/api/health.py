from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}

from app.core.redis import get_redis_pool

@router.post("/test-job")
async def test_job():
    pool = await get_redis_pool()
    job = await pool.enqueue_job("process_document", "sample-doc-123")
    return {"job_id": job.job_id, "message": "Job submitted"}

from app.core.deps import get_current_user
from app.models.user import User

@router.get("/whoami")
def whoami(current_user: User = Depends(get_current_user)):
    return {"user_id": str(current_user.id), "email": current_user.email}