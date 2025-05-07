from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": 5432,
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}
