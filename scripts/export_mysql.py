#!/usr/bin/env python3
"""
scripts/export_mysql.py
Export analytical tables and raw data from MySQL to local CSV files
and upload them directly into HDFS at /ipl_project/sql/.
"""

import csv
import os
import subprocess
import sys
import mysql.connector

# Ensure Big Data environment
if "JAVA_HOME" not in os.environ:
    os.environ["JAVA_HOME"] = "/usr/lib/jvm/java-8-openjdk-amd64"
if "HADOOP_HOME" not in os.environ:
    os.environ["HADOOP_HOME"] = "/opt/hadoop"
os.environ["PATH"] = f"{os.environ['HADOOP_HOME']}/bin:{os.environ['JAVA_HOME']}/bin:{os.environ.get('PATH', '')}"

def get_connection():
    return mysql.connector.connect(
        host=os.environ.get("MYSQL_HOST", "127.0.0.1"),
        port=int(os.environ.get("MYSQL_PORT", 3306)),
        user=os.environ.get("MYSQL_USER", "ipl_user"),
        password=os.environ.get("MYSQL_PASSWORD", "ipl_password"),
        database=os.environ.get("MYSQL_DATABASE", "ipl_db")
    )

def export_query_to_csv(cursor, query, output_path):
    cursor.execute(query)
    columns = [col[0] for col in cursor.description]
    rows = cursor.fetchall()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(rows)

    print(f"Exported {len(rows)} rows to {output_path}")
    return len(rows)

def export_mysql_to_hdfs():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_mysql_dir = os.path.join(base_dir, "output", "mysql")
    os.makedirs(output_mysql_dir, exist_ok=True)

    conn = get_connection()
    cursor = conn.cursor()

    exports = {
        # 1. Full matches table export
        "mysql_matches.csv": "SELECT * FROM matches ORDER BY match_id ASC",
        # 2. Team wins ranking
        "team_wins.csv": """
            SELECT winner_clean AS team, COUNT(*) AS total_wins
            FROM matches
            WHERE winner_clean IS NOT NULL AND winner_clean <> ''
            GROUP BY winner_clean
            ORDER BY total_wins DESC
        """,
        # 3. Matches played by team
        "matches_played.csv": """
            SELECT team, COUNT(*) AS matches_played
            FROM (
                SELECT team1_clean AS team FROM matches
                UNION ALL
                SELECT team2_clean AS team FROM matches
            ) AS appearances
            GROUP BY team
            ORDER BY matches_played DESC
        """,
        # 4. Win percentage by team
        "team_win_percentage.csv": """
            SELECT 
                p.team,
                p.matches_played,
                COALESCE(w.total_wins, 0) AS total_wins,
                ROUND(100.0 * COALESCE(w.total_wins, 0) / p.matches_played, 2) AS win_percentage
            FROM (
                SELECT team, COUNT(*) AS matches_played
                FROM (
                    SELECT team1_clean AS team FROM matches
                    UNION ALL
                    SELECT team2_clean AS team FROM matches
                ) AS all_apps
                GROUP BY team
            ) p
            LEFT JOIN (
                SELECT winner_clean AS team, COUNT(*) AS total_wins
                FROM matches
                WHERE winner_clean IS NOT NULL AND winner_clean <> ''
                GROUP BY winner_clean
            ) w ON p.team = w.team
            ORDER BY win_percentage DESC
        """,
        # 5. Toss decisions
        "toss_decisions.csv": """
            SELECT toss_decision, COUNT(*) AS match_count,
                   ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM matches), 2) AS percentage
            FROM matches
            GROUP BY toss_decision
            ORDER BY match_count DESC
        """,
        # 6. Toss advantage
        "toss_advantage.csv": """
            SELECT 
                toss_winner_clean AS team,
                COUNT(*) AS toss_wins,
                SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) AS match_wins_after_toss,
                ROUND(100.0 * SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS toss_to_win_conversion_pct
            FROM matches
            WHERE toss_winner_clean IS NOT NULL
            GROUP BY toss_winner_clean
            ORDER BY match_wins_after_toss DESC
        """,
        # 7. Venue match counts
        "venue_matches.csv": """
            SELECT venue_clean AS venue, city, COUNT(*) AS total_matches
            FROM matches
            GROUP BY venue_clean, city
            ORDER BY total_matches DESC
        """,
        # 8. Venue defending vs chasing
        "venue_defend_chase.csv": """
            SELECT 
                venue_clean AS venue,
                COUNT(*) AS total_matches,
                SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) AS defending_wins,
                SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) AS chasing_wins,
                SUM(CASE WHEN result = 'tie' THEN 1 ELSE 0 END) AS tied_matches,
                ROUND(100.0 * SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) / 
                      NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS defending_win_pct,
                ROUND(100.0 * SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) / 
                      NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS chasing_win_pct
            FROM matches
            GROUP BY venue_clean
            HAVING total_matches >= 10
            ORDER BY total_matches DESC
        """,
        # 9. Season performance
        "season_performance.csv": """
            SELECT season, winner_clean AS team, COUNT(*) AS season_wins
            FROM matches
            WHERE winner_clean IS NOT NULL AND winner_clean <> ''
            GROUP BY season, winner_clean
            ORDER BY season ASC, season_wins DESC
        """
    }

    print("--- Exporting SQL Analysis Tables ---")
    exported_files = []
    for filename, sql in exports.items():
        out_path = os.path.join(output_mysql_dir, filename)
        export_query_to_csv(cursor, sql, out_path)
        exported_files.append(out_path)

    cursor.close()
    conn.close()

    # Upload exported files to HDFS /ipl_project/sql/
    hdfs_bin = os.environ.get("HDFS_BIN", "/opt/hadoop/bin/hdfs")
    print(f"\n--- Uploading MySQL Exports to HDFS (/ipl_project/sql/) ---")

    # Ensure HDFS /ipl_project/sql directory exists
    subprocess.run([hdfs_bin, "dfs", "-mkdir", "-p", "/ipl_project/sql"], check=True)

    for filepath in exported_files:
        dest = f"/ipl_project/sql/{os.path.basename(filepath)}"
        subprocess.run([hdfs_bin, "dfs", "-put", "-f", filepath, dest], check=True)
        size_output = subprocess.check_output([hdfs_bin, "dfs", "-du", "-h", dest], text=True)
        print(f"  [HDFS VERIFIED] {dest} -> {size_output.strip()}")

    print("\n--- HDFS /ipl_project/sql/ Listing ---")
    subprocess.run([hdfs_bin, "dfs", "-ls", "/ipl_project/sql"], check=True)
    print("\nMySQL export and HDFS upload completed successfully.")

if __name__ == "__main__":
    export_mysql_to_hdfs()
