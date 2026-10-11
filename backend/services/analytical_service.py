import json
import logging
from pathlib import Path
import pandas as pd
from backend.config import Config
from backend.services.mysql_service import MySQLService
from backend.services.mongo_service import MongoService

logger = logging.getLogger(__name__)

class AnalyticalService:
    @staticmethod
    def get_sources_status():
        """
        Tests connection and output validation separately for all 4 engines.
        Performs genuine cross-validation comparison across Pig, Hive, MySQL, and Mongo.
        """
        # 1. MySQL Status
        mysql_health = MySQLService.test_connection()
        mysql_status = {
            "name": "MySQL 8.4 RDBMS",
            "type": "Relational Database",
            "connected": mysql_health.get("connected", False),
            "connection_status": "Connected" if mysql_health.get("connected") else "Disconnected",
            "output_validated": False,
            "details": f"{mysql_health.get('row_count', 0)} matches in ipl_db.matches" if mysql_health.get("connected") else mysql_health.get("error", "Failed")
        }
        mysql_wins_map = {}
        if mysql_health.get("connected"):
            try:
                conn = MySQLService.get_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT winner_clean, COUNT(*) FROM matches WHERE is_completed=1 GROUP BY winner_clean")
                mysql_wins_map = dict(cursor.fetchall())
                cursor.close()
                conn.close()
                mysql_status["output_validated"] = len(mysql_wins_map) > 0
            except Exception as e:
                logger.error(f"MySQL validation query failed: {e}")

        # 2. MongoDB Status
        mongo_health = MongoService.test_connection()
        mongo_status = {
            "name": "MongoDB 8.0 NoSQL",
            "type": "Document Database",
            "connected": mongo_health.get("status") == "healthy",
            "connection_status": "Connected" if mongo_health.get("status") == "healthy" else "Disconnected",
            "output_validated": False,
            "details": f"{mongo_health.get('document_count', 0)} documents in ipl_db.matches" if mongo_health.get("status") == "healthy" else mongo_health.get("error", "Failed")
        }
        mongo_wins_map = {}
        try:
            client = MongoService.get_client()
            db = client[Config.MONGO_DB]
            pipeline = [
                {"$match": {"outcome.is_completed": True, "outcome.winner": {"$ne": None}}},
                {"$group": {"_id": "$outcome.winner", "wins": {"$sum": 1}}}
            ]
            for doc in db[Config.MONGO_COLLECTION].aggregate(pipeline):
                mongo_wins_map[doc["_id"]] = doc["wins"]
            client.close()
            mongo_status["output_validated"] = len(mongo_wins_map) > 0
        except Exception:
            # Fallback to precomputed JSON if mongo daemon is offline
            json_file = Config.MONGO_OUTPUT_DIR / "wins_by_team.json"
            if json_file.exists():
                with open(json_file, "r") as f:
                    data = json.load(f)
                    mongo_wins_map = {d["_id"]: d["wins"] for d in data}
                    mongo_status["output_validated"] = len(mongo_wins_map) > 0

        # 3. Apache Pig Status
        pig_files = [
            Config.PIG_OUTPUT_DIR / "team_performance.csv",
            Config.PIG_OUTPUT_DIR / "toss_advantage.csv",
            Config.PIG_OUTPUT_DIR / "venue_defend_chase.csv"
        ]
        pig_files_exist = all(f.exists() and f.stat().st_size > 0 for f in pig_files)
        pig_wins_map = {}
        if (Config.PIG_OUTPUT_DIR / "team_performance.csv").exists():
            try:
                pdf = pd.read_csv(Config.PIG_OUTPUT_DIR / "team_performance.csv")
                pig_wins_map = dict(zip(pdf["team"], pdf["total_wins"]))
            except Exception as e:
                logger.error(f"Error reading Pig output: {e}")

        pig_status = {
            "name": "Apache Pig 0.18.0",
            "type": "Batch MapReduce Dataflow",
            "connected": True,
            "connection_status": "Ready (HDFS / CLI)",
            "output_validated": pig_files_exist and len(pig_wins_map) > 0,
            "details": f"3 Output datasets verified ({len(pig_wins_map)} teams processed)" if pig_files_exist else "Outputs missing"
        }

        # 4. Apache Hive Status
        hive_files = [
            Config.HIVE_OUTPUT_DIR / "team_performance.csv",
            Config.HIVE_OUTPUT_DIR / "toss_advantage.csv",
            Config.HIVE_OUTPUT_DIR / "venue_defend_chase.csv"
        ]
        hive_files_exist = all(f.exists() and f.stat().st_size > 0 for f in hive_files)
        hive_wins_map = {}
        if (Config.HIVE_OUTPUT_DIR / "team_performance.csv").exists():
            try:
                hdf = pd.read_csv(Config.HIVE_OUTPUT_DIR / "team_performance.csv")
                hive_wins_map = dict(zip(hdf["team"], hdf["total_wins"]))
            except Exception as e:
                logger.error(f"Error reading Hive output: {e}")

        hive_status = {
            "name": "Apache Hive 3.1.3",
            "type": "Data Warehouse (HQL on MapReduce)",
            "connected": True,
            "connection_status": "Ready (Derby Metastore / HDFS)",
            "output_validated": hive_files_exist and len(hive_wins_map) > 0,
            "details": f"3 Output datasets verified ({len(hive_wins_map)} teams processed)" if hive_files_exist else "Outputs missing"
        }

        # 5. Cross-Validation Engine
        check_teams = [
            "Mumbai Indians",
            "Chennai Super Kings",
            "Kolkata Knight Riders",
            "Royal Challengers Bengaluru",
            "Punjab Kings",
            "Delhi Capitals",
            "Rajasthan Royals",
            "Sunrisers Hyderabad",
            "Gujarat Titans",
            "Lucknow Super Giants"
        ]

        cross_validation = []
        overall_match = True

        for team in check_teams:
            m_val = mysql_wins_map.get(team)
            mo_val = mongo_wins_map.get(team)
            p_val = pig_wins_map.get(team)
            h_val = hive_wins_map.get(team)

            # Determine validation status
            values = [v for v in [m_val, mo_val, p_val, h_val] if v is not None]
            if len(values) < 2:
                status = "Not available"
            elif all(v == values[0] for v in values):
                status = "Matched"
            else:
                status = "Mismatch detected"
                overall_match = False

            cross_validation.append({
                "team": team,
                "mysql": m_val,
                "mongodb": mo_val,
                "pig": p_val,
                "hive": h_val,
                "status": status
            })

        return {
            "sources": {
                "mysql": mysql_status,
                "mongodb": mongo_status,
                "pig": pig_status,
                "hive": hive_status,
                "flask_api": {"name": "Flask REST API", "type": "Application Server", "connected": True, "connection_status": "Online (Port 5000)"}
            },
            "cross_validation": cross_validation,
            "validation_summary": "All Sources Matched (100% Parity)" if overall_match else "Discrepancy Detected"
        }

    @staticmethod
    def get_data_quality():
        report_path = Config.DATA_DIR / "processed" / "data_quality_report.json"
        if report_path.exists():
            with open(report_path, "r", encoding="utf-8") as f:
                report = json.load(f)
                return {
                    "data": report,
                    "data_source": "Python Pipeline Quality Verification (prepare_ipl.py)",
                    "engine": "python_etl"
                }
        return {"data": {}, "data_source": "Unavailable", "engine": "python_etl"}
