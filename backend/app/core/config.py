from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "Panopticon"

    VERSION: str = "1.0.0"

    DEBUG: bool = True

    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./panopticon.db"

    class Config:
        env_file = ".env"


settings = Settings()