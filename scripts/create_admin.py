import getpass

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def create_admin():

    db: Session = SessionLocal()

    try:

        email = input("Admin email: ").strip()
        password = getpass.getpass("Admin password: ")
        confirm_password = getpass.getpass(
            "Confirm password: "
        )

        if not email:
            print("Email is required.")
            return

        if not password:
            print("Password is required.")
            return

        if password != confirm_password:
            print("Passwords do not match.")
            return

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:

            if existing_user.role == "admin":
                print("This user is already an admin.")
                return

            existing_user.role = "admin"
            existing_user.tier = "free"
            existing_user.is_active = True

            db.commit()

            print(
                f"Existing user {email} promoted to admin."
            )

            return

        admin = User(
            email=email,
            hashed_password=hash_password(password),
            role="admin",
            tier="free",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print()
        print("Admin account created successfully.")
        print(f"Email: {email}")
        print("Role: admin")
        print("Tier: free")

    finally:

        db.close()


if __name__ == "__main__":
    create_admin()