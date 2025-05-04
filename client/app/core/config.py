# config.py
import os


class Settings:
    AI_SERVER_URL = os.getenv("AI_SERVER_URL")


settings = Settings()
