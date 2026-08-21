from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongodb_uri: str = "mongodb://127.0.0.1:27017/bsquare_mobile"
    jwt_secret: str
    jwt_refresh_secret: str
    jwt_expires_in: str = "24h"
    jwt_refresh_expires_in: str = "7d"
    port: int = 5001
    node_env: str = "development"
    client_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000,http://localhost:8080"
    upload_dir: str = "uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
