from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.usage_record import UsageRecord
from app.models.document import Document
from app.core.config import TIER_LIMITS


def log_usage(db: Session, owner_id, operation: str, units_consumed: int, unit: str):
    db.add(UsageRecord(owner_id=owner_id, operation=operation, units_consumed=units_consumed, unit=unit))
    db.commit()

def get_monthly_usage(db: Session, owner_id, unit: str) -> int:
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total = db.query(UsageRecord).filter(
        UsageRecord.owner_id == owner_id,
        UsageRecord.unit == unit,
        UsageRecord.created_at >= start_of_month,
    ).with_entities(UsageRecord.units_consumed).all()
    return sum(t[0] for t in total)

def is_within_token_quota(db: Session, owner_id, tier: str) -> bool:
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])["monthly_tokens"]
    used = get_monthly_usage(db, owner_id, "tokens")
    return used < limit


def check_token_quota(db: Session, owner_id, tier: str):
    if not is_within_token_quota(db, owner_id, tier):
        used = get_monthly_usage(db, owner_id, "tokens")
        limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])["monthly_tokens"]
        raise HTTPException(status_code=429, detail=f"Monthly token quota exceeded ({used}/{limit}). Upgrade your plan to continue.")

def is_within_search_unit_quota(db: Session, owner_id, tier: str) -> bool:
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])["monthly_search_units"]
    used = get_monthly_usage(db, owner_id, "search_units")
    return used < limit

def check_search_unit_quota(db: Session, owner_id, tier: str):
    if not is_within_search_unit_quota(db, owner_id, tier):
        used = get_monthly_usage(db, owner_id, "search_units")
        limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])["monthly_search_units"]
        raise HTTPException(status_code=429, detail=f"Monthly search unit quota exceeded ({used}/{limit}). Upgrade your plan to continue.")


def get_storage_used_mb(db: Session, owner_id) -> float:
    total_bytes = db.query(Document).filter(Document.owner_id == owner_id).with_entities(Document.file_size_bytes).all()
    return round(sum(b[0] or 0 for b in total_bytes) / (1024 * 1024), 2)


def check_storage_quota(db: Session, owner_id, tier: str, incoming_bytes: int):
    limit_mb = TIER_LIMITS.get(tier, TIER_LIMITS["free"])["storage_mb"]
    used_mb = get_storage_used_mb(db, owner_id)
    if used_mb + (incoming_bytes / (1024 * 1024)) > limit_mb:
        raise HTTPException(status_code=429, detail=f"Storage quota exceeded ({used_mb}MB/{limit_mb}MB). Delete documents or upgrade your plan.")