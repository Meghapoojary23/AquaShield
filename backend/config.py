import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

DATABASE_DIR = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.join(DATABASE_DIR, "aquashield.db")

MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

RAW_DATA_1 = os.path.join(PROJECT_ROOT, "data_2014_23.csv")
RAW_DATA_2 = os.path.join(PROJECT_ROOT, "data_22-23.csv")
PROCESSED_DATA_PATH = os.path.join(DATABASE_DIR, "processed_climate_data.csv")

SECRET_KEY = os.environ.get("SECRET_KEY", "aquashield-dev-key-2026")

# Ensure required directories exist
for d in [DATABASE_DIR, MODELS_DIR, REPORTS_DIR]:
    os.makedirs(d, exist_ok=True)
