from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.deps import get_db 
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.request_log import RequestLog

from app.services.usage_service import get_monthly_usage, get_storage_used_mb
from app.models.usage_record import UsageRecord
from sqlalchemy import func
from app.core.config import TIER_LIMITS

router = APIRouter(prefix="/users", tags=["user"])

@router.get("/usage")
def my_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tier = current_user.tier or "free"

    return {
        "tier": tier,
        "documents_count": db.query(Document).filter(
            Document.owner_id == current_user.id
        ).count(),
        "storage_used_mb": get_storage_used_mb(
            db,
            current_user.id,
        ),
        "storage_limit_mb": TIER_LIMITS[tier]["storage_mb"],
        "tokens_used_this_month": get_monthly_usage(
            db,
            current_user.id,
            "tokens",
        ),
        "token_limit_this_month": TIER_LIMITS[tier]["monthly_tokens"],
        "search_units_used_this_month": get_monthly_usage(
            db,
            current_user.id,
            "search_units",
        ),
        "search_unit_limit_this_month": TIER_LIMITS[tier]["monthly_search_units"],
    }