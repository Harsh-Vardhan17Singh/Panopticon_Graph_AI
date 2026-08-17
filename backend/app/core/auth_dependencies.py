from fatsapi import Depends, HTTPException , status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.dependencies import get_db
from app.models.user import User

security = HTTPBearer()

def get_current_user(
        credentials : HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db),
) -> User:
    """
    Get and Verify the Currently authenticated user. 
    """

    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            details="Invalid token",
        )

    user = (
        db.query(User)
        .filter(User.id == user.id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            details="User not Found"
        )
    return user
