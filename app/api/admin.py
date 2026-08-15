from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.models.document import Document
from app.models.request_log import RequestLog

from app.services.usage_service import get_monthly_usage, get_storage_used_mb
from app.models.usage_record import UsageRecord
from sqlalchemy import func
from app.core.config import TIER_LIMITS

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).all()


@router.patch("/users/{user_id}/suspend")
def suspend_user(user_id, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} suspended"}

@router.patch("/users/{user_id}/activate")
def activate_user(
    user_id,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.is_active = True

    db.commit()

    return {
        "message": f"User {user.email} activated"
    }


@router.get("/stats")
def platform_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(func.count(User.id)).scalar(),
        
        "total_documents": db.query(func.count(Document.id)).scalar(),

        "total_requests_today": db.query(func.count(RequestLog.id)).filter(
            func.date(RequestLog.created_at) == func.current_date()
        ).scalar(),
        "avg_response_time_ms": db.query(func.avg(RequestLog.duration_ms)).scalar(),

        "total_tokens_today": db.query(
            func.sum(UsageRecord.units_consumed)
        ).filter(
            UsageRecord.unit == "tokens",
            func.date(UsageRecord.created_at) == func.current_date(),
        ).scalar() or 0,

        "total_search_units_today": db.query(
            func.sum(UsageRecord.units_consumed)
        ).filter(
            UsageRecord.unit == "search_units",
            func.date(UsageRecord.created_at) == func.current_date(),
        ).scalar() or 0,
    }

@router.get("/users/{user_id}/usage")
def user_usage(user_id, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    doc_counts = db.query(Document.document_type, func.count(Document.id)).filter(
        Document.owner_id == user_id
    ).group_by(Document.document_type).all()

    tier = user.tier or "free"

    return {
        "email": user.email,
        "tier": tier,
        "documents_by_type": dict(doc_counts),
        "storage_used_mb": get_storage_used_mb(db, user_id),
        "storage_limit_mb": TIER_LIMITS[tier]["storage_mb"],
        "tokens_used_this_month": get_monthly_usage(db, user_id, "tokens"),
        "token_limit_this_month": TIER_LIMITS[tier]["monthly_tokens"],
        "search_units_used_this_month": get_monthly_usage(db, user_id, "search_units"),
        "search_unit_limit_this_month": TIER_LIMITS[tier]["monthly_search_units"],
    }