import pytest
import csv
import json
from pathlib import Path
import pandas as pd
import mysql.connector
from pymongo import MongoClient

BASE_DIR = Path("/home/hemakumar_t3/ipl-bigdata")

def test_raw_dataset_integrity():
    raw_file = BASE_DIR / "data" / "raw" / "ipl.csv"
    assert raw_file.exists(), "Raw dataset must exist"
    with open(raw_file, "r", encoding="utf-8") as f:
        lines = [l for l in f if l.strip()]
    assert len(lines) == 1170, f"Expected 1170 lines (1 header + 1169 data), got {len(lines)}"

def test_clean_dataset_integrity():
    clean_file = BASE_DIR / "data" / "processed" / "ipl_clean.csv"
    assert clean_file.exists(), "Cleaned dataset must exist"
    df = pd.read_csv(clean_file)
    assert len(df) == 1169, f"Expected 1169 cleaned matches, got {len(df)}"
    assert "match_id" in df.columns, "Surrogate key match_id must be present"

def test_mysql_record_count():
    conn = mysql.connector.connect(
        host="localhost", port=3306, user="ipl_user", password="ipl_password", database="ipl_db"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM matches")
    count = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    assert count == 1169, f"MySQL expected 1169 rows, got {count}"

def test_mongo_document_count():
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    db = client["ipl_db"]
    count = db["matches"].count_documents({})
    client.close()
    assert count == 1169, f"MongoDB expected 1169 docs, got {count}"

def test_pig_hive_parity():
    pig_df = pd.read_csv(BASE_DIR / "output" / "pig" / "team_performance.csv")
    hive_df = pd.read_csv(BASE_DIR / "output" / "hive" / "team_performance.csv")
    
    pig_wins = dict(zip(pig_df["team"], pig_df["total_wins"]))
    hive_wins = dict(zip(hive_df["team"], hive_df["total_wins"]))
    
    for team, p_win in pig_wins.items():
        if team in hive_wins:
            assert p_win == hive_wins[team], f"Parity mismatch for {team}: Pig={p_win}, Hive={hive_wins[team]}"

def test_toss_win_consistency():
    # Load toss outcomes
    hive_toss = pd.read_csv(BASE_DIR / "output" / "hive" / "toss_advantage.csv")
    assert len(hive_toss) > 0
    # Top toss winner Mumbai Indians
    mi_row = hive_toss[hive_toss["team"] == "Mumbai Indians"].iloc[0]
    assert int(mi_row["toss_wins"]) == 151
    assert int(mi_row["match_wins_after_toss"]) == 82
