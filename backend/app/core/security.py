from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext


import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Convert a plain password into a hashed password.
    """

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify whether a plain password matches its hashed version.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    data: dict,
) -> str:
    """
    Create a JWT access token.
    """

    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({
        "exp": expire
    })

    access_token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return access_token


def decode_access_token(
    token: str,
) -> dict | None:
    """
    Decode and verify a JWT access token.
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        return None