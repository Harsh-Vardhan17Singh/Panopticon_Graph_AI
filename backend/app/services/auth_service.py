from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.models.organization import Organization
from app.models.user import User

from app.schemas.user import (
    UserLogin,
    UserRegister,
)


class AuthService:
    """
    Contains business logic for user registration and login.
    """

    def register_user(
        self,
        db: Session,
        user_data: UserRegister,
    ) -> User:

        existing_user = (
            db.query(User)
            .filter(User.email == user_data.email)
            .first()
        )

        if existing_user:
            raise ValueError("Email already registered")

        organization = (
            db.query(Organization)
            .first()
        )

        if organization is None:
            raise ValueError(
                "No organization found. Seed the database first."
            )

        hashed_password = hash_password(
            user_data.password
        )

        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password=hashed_password,
            role="analyst",
            organization_id=organization.id,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    def login_user(
        self,
        db: Session,
        login_data: UserLogin,
    ) -> str:

        user = (
            db.query(User)
            .filter(
                User.email == login_data.email
            )
            .first()
        )

        # Don't reveal whether the email exists.
        if user is None:
            raise ValueError(
                "Invalid email or password"
            )

        # ACTUALLY VERIFY PASSWORD
        if not verify_password(
            login_data.password,
            user.password,
        ):
            raise ValueError(
                "Invalid email or password"
            )

        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "role": user.role,
            }
        )

        return access_token


auth_service = AuthService()