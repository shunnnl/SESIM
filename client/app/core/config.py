import os


class Settings:
    AI_SERVER_BASE_URL = os.getenv("AI_SERVER_BASE_URL")
    AI_SERVER_PORT = os.getenv("AI_SERVER_PORT")
    SAAS_SERVER_BASE_URL = os.getenv("SAAS_SERVER_BASE_URL")


settings = Settings()
