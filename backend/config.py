import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(Path(__file__).resolve().parent / ".env")

class Config:
    PROJECT_NAME = "IPL Big Data Analytics Engine"
    VERSION = "2.0.0"
    
    # MySQL Database Configuration
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "ipl_user")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "ipl_password")
    MYSQL_DB = os.getenv("MYSQL_DB", "ipl_db")
    
    # MongoDB Configuration
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    MONGO_DB = os.getenv("MONGO_DB", "ipl_db")
    MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "matches")
    
    # Output and Data Paths
    DATA_DIR = BASE_DIR / "data"
    OUTPUT_DIR = BASE_DIR / "output"
    PIG_OUTPUT_DIR = OUTPUT_DIR / "pig"
    HIVE_OUTPUT_DIR = OUTPUT_DIR / "hive"
    MYSQL_OUTPUT_DIR = OUTPUT_DIR / "mysql"
    MONGO_OUTPUT_DIR = OUTPUT_DIR / "mongodb"
    
    # HDFS URL
    HDFS_URL = os.getenv("HDFS_URL", "hdfs://localhost:9000")
