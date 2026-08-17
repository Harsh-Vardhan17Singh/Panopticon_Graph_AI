from fastapi import Depends, HTTPException, status

from app.core.auth_dependencies import get_current_user
from app.models.user import User


def require_role(*allowed_roles: str):
    """
    Check whether the current user has one of the allowed roles.
    """

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        return current_user

    return role_checker