#!/usr/bin/env python3
"""
scripts/load_mysql.py
Load cleaned IPL dataset into MySQL database with transaction handling,
parameterized batch inserts, and row-count validation.
"""

import csv
import os
import sys
import mysql.connector

def get_db_connection(use_database=True):
    host = os.environ.get("MYSQL_HOST", "127.0.0.1")
    port = int(os.environ.get("MYSQL_PORT", 3306))
    user = os.environ.get("MYSQL_USER", "ipl_user")
    password = os.environ.get("MYSQL_PASSWORD", "ipl_password")
    database = os.environ.get("MYSQL_DATABASE", "ipl_db") if use_database else None

    kwargs = {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "autocommit": False
    }
    if database:
        kwargs["database"] = database

    return mysql.connector.connect(**kwargs)

def init_schema(conn, schema_path):
    print(f"Applying schema from {schema_path}...")
    with open(schema_path, "r", encoding="utf-8") as f:
        sql = f.read()

    cursor = conn.cursor()
    # Split queries by semicolon outside comments
    statements = [stmt.strip() for stmt in sql.split(";") if stmt.strip()]
    for stmt in statements:
        # Ignore comments and empty statements
        lines = [line for line in stmt.splitlines() if not line.strip().startswith("--")]
        clean_stmt = " ".join(lines).strip()
        if clean_stmt:
            cursor.execute(clean_stmt)
    conn.commit()
    cursor.close()
    print("Schema initialized successfully.")

def load_data(clean_csv_path):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    schema_path = os.path.join(base_dir, "sql", "schema.sql")

    conn = get_db_connection(use_database=False)
    init_schema(conn, schema_path)

    cursor = conn.cursor()

    insert_sql = """
        INSERT INTO matches (
            match_id, team1, team2, team1_clean, team2_clean, match_date,
            toss_winner, toss_winner_clean, toss_decision, winner, winner_clean,
            player_of_match, venue, venue_clean, city, season, match_number,
            match_type, result, result_margin, target_runs, target_overs,
            super_over, is_completed, toss_winner_won
        ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s
        )
    """

    print(f"Reading records from {clean_csv_path}...")
    records = []
    with open(clean_csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            # Safe type conversions
            match_id = int(r["match_id"])
            team1 = r["team1"]
            team2 = r["team2"]
            team1_clean = r["team1_clean"]
            team2_clean = r["team2_clean"]
            match_date = r["match_date"]
            toss_winner = r["toss_winner"]
            toss_winner_clean = r["toss_winner_clean"]
            toss_decision = r["toss_decision"]
            winner = r["winner"] if r["winner"] else None
            winner_clean = r["winner_clean"] if r["winner_clean"] else None
            player_of_match = r["player_of_match"] if r["player_of_match"] else None
            venue = r["venue"]
            venue_clean = r["venue_clean"]
            city = r["city"] if r["city"] else None
            season = int(r["season"]) if r["season"] else 0
            match_number = int(r["match_number"]) if r["match_number"] else None
            match_type = r["match_type"]
            result = r["result"]
            result_margin = float(r["result_margin"]) if r["result_margin"] else None
            target_runs = float(r["target_runs"]) if r["target_runs"] else None
            target_overs = float(r["target_overs"]) if r["target_overs"] else None
            super_over = r["super_over"]
            is_completed = int(r["is_completed"])
            toss_winner_won = int(r["toss_winner_won"]) if r["toss_winner_won"] != "" else None

            record = (
                match_id, team1, team2, team1_clean, team2_clean, match_date,
                toss_winner, toss_winner_clean, toss_decision, winner, winner_clean,
                player_of_match, venue, venue_clean, city, season, match_number,
                match_type, result, result_margin, target_runs, target_overs,
                super_over, is_completed, toss_winner_won
            )
            records.append(record)

    batch_size = 250
    total = len(records)
    print(f"Inserting {total} records in batches of {batch_size}...")

    try:
        for i in range(0, total, batch_size):
            chunk = records[i:i + batch_size]
            cursor.executemany(insert_sql, chunk)
            conn.commit()
            print(f"  Inserted {min(i + batch_size, total)}/{total} rows...")

        # Verification query
        cursor.execute("SELECT COUNT(*) FROM matches")
        count = cursor.fetchone()[0]
        print(f"\n[VERIFIED] Total matches loaded into MySQL: {count}")

        if count != total:
            raise ValueError(f"Mismatch: expected {total} rows, but database has {count} rows!")

        # Quality check query
        cursor.execute("""
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN winner IS NULL THEN 1 ELSE 0 END) AS null_winners,
                SUM(CASE WHEN super_over = 'Y' THEN 1 ELSE 0 END) AS super_overs,
                COUNT(DISTINCT winner_clean) AS distinct_winning_teams,
                COUNT(DISTINCT venue_clean) AS distinct_venues
            FROM matches
        """)
        q_row = cursor.fetchone()
        print(f"Data Summary: Total={q_row[0]}, Null Winners={q_row[1]}, Super Overs={q_row[2]}, Teams={q_row[3]}, Venues={q_row[4]}")

    except Exception as e:
        conn.rollback()
        print(f"Error during MySQL insert: {e}", file=sys.stderr)
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    clean_csv = os.path.join(base_dir, "data", "processed", "ipl_clean.csv")
    load_data(clean_csv)
