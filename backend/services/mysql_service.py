"""
backend/services/mysql_service.py
MySQL Relational Data Service with strict denominator validation,
canonical franchise integration, and fallback to the verified AnalyticalService.
"""

import logging
from typing import Dict, List, Optional, Any
import mysql.connector

from backend.config import Config
from backend.services.team_registry import (
    normalize_team_name,
    is_active_franchise,
    get_team_metadata,
    ACTIVE_FRANCHISES,
    HISTORICAL_FRANCHISES,
    ALL_FRANCHISES
)

logger = logging.getLogger(__name__)

def parse_season(val):
    if not val or str(val).lower() in ('all', 'none', ''):
        return None
    try:
        s = int(val)
        if s >= 2008:
            return s - 2007
        return s
    except (ValueError, TypeError):
        return None

class MySQLService:
    @staticmethod
    def get_connection():
        return mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB,
            connection_timeout=2
        )

    @classmethod
    def test_connection(cls) -> Dict[str, Any]:
        try:
            conn = cls.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM matches")
            row_count = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            return {"status": "connected", "connected": True, "row_count": row_count, "engine": "MySQL 8.4 RDBMS"}
        except Exception as e:
            logger.warning(f"MySQL connection failed: {e}")
            return {"status": "disconnected", "connected": False, "error": str(e), "engine": "MySQL 8.4 RDBMS"}

    @classmethod
    def get_overview(cls, season=None) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            where_clause = "WHERE season = %s" if s_num else ""
            params = [s_num] if s_num else []

            # Overall KPIs with rigorous denominator rules
            cursor.execute(f"""
                SELECT 
                    COUNT(*) as total_matches,
                    SUM(CASE WHEN winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END) as completed_matches,
                    COUNT(DISTINCT team1_clean) as unique_teams,
                    COUNT(DISTINCT venue_clean) as unique_venues,
                    SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' AND toss_winner_clean = winner_clean THEN 1 ELSE 0 END) as toss_winner_match_winner,
                    SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END) as valid_toss_matches,
                    ROUND(
                        SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' AND toss_winner_clean = winner_clean THEN 1 ELSE 0 END) * 100.0 / 
                        NULLIF(SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END), 0),
                        2
                    ) as toss_win_pct
                FROM matches
                {where_clause}
            """, params)
            kpis = cursor.fetchone()

            # Top teams by wins
            cursor.execute(f"""
                SELECT 
                    winner_clean as team,
                    COUNT(*) as total_wins
                FROM matches
                WHERE winner_clean IS NOT NULL AND winner_clean != ''
                {"AND season = %s" if s_num else ""}
                GROUP BY winner_clean
                ORDER BY total_wins DESC
                LIMIT 8
            """, params if s_num else [])
            top_teams = cursor.fetchall()
            for t in top_teams:
                meta = get_team_metadata(t["team"])
                t["short_name"] = meta.get("short_name", t["team"])
                t["code"] = meta.get("code", "")
                t["primary_color"] = meta.get("primary_color", "#38bdf8")

            # Top venues by match count
            cursor.execute(f"""
                SELECT 
                    venue_clean as venue,
                    COUNT(*) as match_count
                FROM matches
                {where_clause}
                GROUP BY venue_clean
                ORDER BY match_count DESC
                LIMIT 8
            """, params)
            top_venues = cursor.fetchall()

            # Season match trends
            cursor.execute("""
                SELECT 
                    season,
                    (season + 2007) as year,
                    COUNT(*) as matches,
                    SUM(CASE WHEN winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END) as completed
                FROM matches
                GROUP BY season
                ORDER BY season ASC
            """)
            season_trends = cursor.fetchall()

            # Toss decisions breakdown
            cursor.execute(f"""
                SELECT 
                    LOWER(toss_decision) as decision,
                    COUNT(*) as count,
                    SUM(CASE WHEN toss_winner_clean IS NOT NULL AND winner_clean IS NOT NULL AND toss_winner_clean = winner_clean THEN 1 ELSE 0 END) as wins,
                    SUM(CASE WHEN toss_winner_clean IS NOT NULL AND winner_clean IS NOT NULL THEN 1 ELSE 0 END) as valid_matches
                FROM matches
                {where_clause}
                GROUP BY LOWER(toss_decision)
            """, params)
            dec_rows = cursor.fetchall()
            toss_decisions = []
            for dr in dec_rows:
                d = dr["decision"]
                vm = dr["valid_matches"] or 0
                w = dr["wins"] or 0
                toss_decisions.append({
                    "decision": d,
                    "label": "Field First" if d == "field" else "Bat First",
                    "count": dr["count"],
                    "valid_matches": vm,
                    "wins": w,
                    "win_pct": round(w / vm * 100, 1) if vm > 0 else 0.0
                })

            cursor.close()
            conn.close()

            completed = kpis["completed_matches"] or 0
            total = kpis["total_matches"] or 0
            toss_won = kpis["toss_winner_match_winner"] or 0
            kpis["no_results"] = total - completed
            kpis["latest_season"] = 18
            kpis["latest_year"] = 2025
            kpis["data_coverage"] = "2008 - 2025 (Seasons 1 - 18)"
            kpis["denominator_explanation"] = (
                f"Toss win percentage is calculated as {toss_won} wins / {completed} matches with a known outcome "
                f"(excluding {total - completed} no-results/abandoned games)."
            )

            return {
                "kpis": kpis,
                "top_teams": top_teams,
                "top_venues": top_venues,
                "season_match_trends": season_trends,
                "toss_decisions": toss_decisions,
                "data_source": "MySQL 8.4 Relational Database (Verified Aggregates)",
                "engine": "mysql"
            }
        except Exception as e:
            logger.warning(f"MySQL get_overview failed, delegating to AnalyticalService: {e}")
            return AnalyticalService.get_overview(season=season)

    @classmethod
    def get_teams(cls) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        try:
            conn = cls.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT team1_clean 
                FROM matches 
                WHERE team1_clean IS NOT NULL AND team1_clean != ''
                ORDER BY team1_clean ASC
            """)
            raw_teams = [row[0] for row in cursor.fetchall()]
            cursor.close()
            conn.close()

            # Ensure all canonical active and historical teams are represented
            teams = sorted(list(set(raw_teams).union(set(ALL_FRANCHISES.keys()))))
            return {"teams": teams, "data_source": "MySQL 8.4 Relational Database", "engine": "mysql"}
        except Exception as e:
            logger.warning(f"MySQL get_teams failed: {e}")
            return {
                "teams": sorted(list(ALL_FRANCHISES.keys())),
                "data_source": "Canonical Franchise Registry",
                "engine": "team_registry"
            }

    @classmethod
    def get_teams_performance(cls, season=None, team=None) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        # AnalyticalService provides canonical registry mapping and exact denominator calculations
        return AnalyticalService.get_teams_performance(season=season, team=team)

    @classmethod
    def get_toss_analysis(cls, season=None) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        # AnalyticalService provides bat/field decision win rates, bat-first vs field-first, and season trends
        return AnalyticalService.get_toss_analysis(season=season)

    @classmethod
    def get_venues(cls, season=None) -> Dict[str, Any]:
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            where_str = "WHERE season = %s" if s_num else ""
            params = [s_num] if s_num else []

            cursor.execute(f"""
                SELECT 
                    venue_clean as venue,
                    city,
                    COUNT(*) as match_count
                FROM matches
                {where_str}
                GROUP BY venue_clean, city
                ORDER BY match_count DESC
            """, params)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return {"venues": rows, "data_source": "MySQL 8.4 Relational Analytics", "engine": "mysql"}
        except Exception as e:
            logger.warning(f"MySQL get_venues failed, delegating to AnalyticalService: {e}")
            from backend.services.analytical_service import AnalyticalService
            df = AnalyticalService.get_dataframe()
            s_num = AnalyticalService.parse_season_param(season)
            if s_num:
                df = df[df["season_num"] == s_num]
            v_counts = df.groupby(["venue_clean", "city"]).size().reset_index(name="match_count")
            v_counts = v_counts.sort_values(by="match_count", ascending=False)
            v_counts.rename(columns={"venue_clean": "venue"}, inplace=True)
            return {"venues": v_counts.to_dict(orient="records"), "data_source": "Analytical Service", "engine": "analytics_engine"}

    @classmethod
    def get_venues_performance(cls, venue=None, season=None) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        return AnalyticalService.get_venues_performance(venue=venue, season=season)

    @classmethod
    def get_seasons(cls, season=None, team=None) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        return AnalyticalService.get_seasons(season=season, team=team)

    @classmethod
    def get_head_to_head(cls, team1: str, team2: str) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        return AnalyticalService.get_head_to_head(team1=team1, team2=team2)

    @classmethod
    def get_insights(cls) -> Dict[str, Any]:
        from backend.services.analytical_service import AnalyticalService
        return AnalyticalService.get_insights()
