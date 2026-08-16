from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "change-this-to-a-long-random-string-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated='auto',
)

def hash_password(password: str) -> str:
    """
    Hash A plain password before storing in the DB.
    """

    return pwd_context.hash(password)

def verify_password(
        plain_password:str,
        hashed_password:str,
) -> bool:
    """
    Verify a plain password against its stored hashed version.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )

def create_access_token(
        data:dict,
        expire_delta:timedelta | None = None,
) -> str:
    """
    Create a JWT Access token.
    """
    to_encode = data.copy()

    if expire_delta:
        expire = datetime.now(timezone.utc) + expire_delta
    else:
        expire = (
            datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

    to_encode.update(
        {"exp":expire}
    )

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt