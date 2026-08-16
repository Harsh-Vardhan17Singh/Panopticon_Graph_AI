from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """
    Data required to register a new user.
    """

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name of the user"
    )

    email: EmailStr = Field(
        ...,
        description="User email address"
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="User password"
    )


class UserLogin(BaseModel):
    """
    Data required for user login.
    """

    email: EmailStr = Field(
        ...,
        description="User email address"
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="User password"
    )


class UserResponse(BaseModel):
    """
    Data returned to the client for a user.
    """

    id: int
    full_name: str
    email: EmailStr
    role: str
    organization_id: int

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """
    Authentication token returned after successful login.
    """

    access_token: str
    token_type: str = "bearer"