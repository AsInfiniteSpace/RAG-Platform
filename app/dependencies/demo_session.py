# app/dependencies/demo_session.py
import uuid
from fastapi import Request, Response, HTTPException
from app.core.redis import redis_client  # your existing sync redis.Redis instance

DEMO_COOKIE_NAME = "demo_session_id"
DEMO_DAILY_LIMIT = 6
DEMO_TTL_SECONDS = 60 * 60 * 24

def get_demo_session(request: Request, response: Response) -> str:
    session_id = request.cookies.get(DEMO_COOKIE_NAME)
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(
            key=DEMO_COOKIE_NAME,
            value=session_id,
            httponly=True,
            samesite="none",
            secure=True,
            max_age=DEMO_TTL_SECONDS,
        )
    return session_id

def check_demo_rate_limit(session_id: str) -> None:
    key = f"demo:usage:{session_id}"
    count = redis_client.incr(key)
    if count == 1:
        redis_client.expire(key, DEMO_TTL_SECONDS)
    if count > DEMO_DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="You've reached today's demo limit. Register for unlimited use.",
        )

# app/dependencies/demo_session.py  (add below the existing functions)

DEMO_GLOBAL_DAILY_TOKEN_BUDGET = 40_000  # tune based on what you're comfortable spending/day

def check_demo_global_budget() -> None:
    """Raise if today's total demo token spend already exceeds the daily budget."""
    from datetime import date
    key = f"demo:global:tokens:{date.today().isoformat()}"
    used = int(redis_client.get(key) or 0)
    if used >= DEMO_GLOBAL_DAILY_TOKEN_BUDGET:
        raise HTTPException(
            status_code=503,
            detail="The live demo is at capacity for today — please check back tomorrow, or register for full access.",
        )

def record_demo_tokens(tokens_used: int) -> None:
    from datetime import date
    key = f"demo:global:tokens:{date.today().isoformat()}"
    redis_client.incrby(key, tokens_used)
    redis_client.expire(key, 60 * 60 * 26)  # a bit over 24h so it survives timezone edge cases