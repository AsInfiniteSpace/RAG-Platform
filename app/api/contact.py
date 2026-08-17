import time
from app.core.logging import setup_logging
from fastapi import APIRouter, HTTPException, Request

from app.schemas.contact import ContactRequest
from app.services.email import send_contact_email

logger = setup_logging()

router = APIRouter(
    prefix="/contact",
    tags=["Contact"],
)


# Basic in-memory rate limiting.
# IP -> list of submission timestamps
_contact_attempts: dict[str, list[float]] = {}

RATE_LIMIT = 3
RATE_WINDOW = 60 * 15  # 15 minutes


def check_rate_limit(ip_address: str) -> bool:

    now = time.time()

    attempts = _contact_attempts.get(
        ip_address,
        [],
    )

    # Keep only recent attempts.
    attempts = [
        timestamp
        for timestamp in attempts
        if now - timestamp < RATE_WINDOW
    ]

    if len(attempts) >= RATE_LIMIT:

        _contact_attempts[ip_address] = attempts

        return False

    attempts.append(now)

    _contact_attempts[ip_address] = attempts

    return True


@router.post("")
def submit_contact_form(
    data: ContactRequest,
    request: Request,
):

    # Honeypot.
    # A real user should never fill this field.
    if data.website.strip():

        # Pretend the submission succeeded.
        # This prevents bots from learning that they were blocked.
        return {
            "message": "Your message has been sent successfully."
        }


    client_ip = (
        request.client.host
        if request.client
        else "unknown"
    )


    if not check_rate_limit(client_ip):

        raise HTTPException(
            status_code=429,
            detail=(
                "Too many messages have been submitted. "
                "Please try again later."
            ),
        )


    try:

        send_contact_email(
            name=data.name,
            email=str(data.email),
            subject=data.subject,
            message=data.message,
        )

        return {
            "message": "Your message has been sent successfully."
        }

    except Exception:
        logger.exception("Contact form submission failed")
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to send your message right now. "
                "Please try again later."
            ),
        )