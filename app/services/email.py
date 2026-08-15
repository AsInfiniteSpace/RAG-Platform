import smtplib

from email.message import EmailMessage

from app.core.config import settings


def send_contact_email(
    name: str,
    email: str,
    subject: str,
    message: str,
) -> None:

    mail = EmailMessage()

    mail["Subject"] = f"[RAG Platform Contact] {subject}"
    mail["From"] = settings.smtp_username
    mail["To"] = settings.contact_email
    mail["Reply-To"] = email

    mail.set_content(
        f"""New contact form message

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
"""
    )

    with smtplib.SMTP(
        settings.smtp_host,
        settings.smtp_port,
        timeout=20,
    ) as smtp:

        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()

        smtp.login(
            settings.smtp_username,
            settings.smtp_password,
        )

        smtp.send_message(mail)