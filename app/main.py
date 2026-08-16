from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.retrieval import router as retrieval_router
from app.api.eval import router as eval_router
from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router
from app.api.admin import router as admin_router
from app.api.user_usage import router as user_usage
from app.api.contact import router as contact_router


from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

logger = setup_logging()

app = FastAPI(title=settings.app_name)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zgk0jppn-3000.inc1.devtunnels.ms",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)"""



app.include_router(health_router)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(retrieval_router)
app.include_router(eval_router)
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(admin_router)
app.include_router(user_usage)
app.include_router(contact_router)

@app.on_event("startup")
def on_startup():
    logger.info(f"Starting {settings.app_name} in {settings.environment} mode")