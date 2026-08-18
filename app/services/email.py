import resend

from app.core.config import settings


def send_contact_email(
    name: str,
    email: str,
    subject: str,
    message: str,
) -> None:

    resend.api_key = settings.resend_api_key

    params: resend.Emails.SendParams = {
        "from": settings.contact_from_email,
        "to": [settings.contact_email],
        "subject": f"[RAG Platform Contact] {subject}",
        "reply_to": email,
        "text": f"""New contact form message

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
""",
    }

    resend.Emails.send(params)
