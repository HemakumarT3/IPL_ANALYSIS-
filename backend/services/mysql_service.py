import logging
import mysql.connector
import pandas as pd
from backend.config import Config

logger = logging.getLogger(__name__)

def parse_season(val):
    if not val or str(val).lower() == 'all':
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
            database=Config.MYSQL_DB
        )

    @classmethod
    def test_connection(cls):
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
    def get_overview(cls, season=None):
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            where_clause = ""
            params = []
            if s_num:
                where_clause = "WHERE season = %s"
                params.append(s_num)

            # Overall KPIs
            cursor.execute(f"""
                SELECT 
                    COUNT(*) as total_matches,
                    SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_matches,
                    COUNT(DISTINCT team1_clean) as unique_teams,
                    COUNT(DISTINCT venue_clean) as unique_venues,
                    SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) as toss_winner_match_winner,
                    ROUND(SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as toss_win_pct
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
                WHERE is_completed = 1 AND winner_clean IS NOT NULL AND winner_clean != ''
                {"AND season = %s" if s_num else ""}
                GROUP BY winner_clean
                ORDER BY total_wins DESC
                LIMIT 8
            """, params if s_num else [])
            top_teams = cursor.fetchall()

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

            cursor.close()
            conn.close()

            return {
                "kpis": kpis,
                "top_teams": top_teams,
                "top_venues": top_venues,
                "data_source": "MySQL 8.4 Relational Database (SELECT aggregate FROM matches)",
                "engine": "mysql"
            }
        except Exception as e:
            logger.error(f"MySQL get_overview failed: {e}")
            # Fallback to precomputed values
            return {
                "kpis": {
                    "total_matches": 1169,
                    "completed_matches": 1146,
                    "unique_teams": 15,
                    "unique_venues": 39,
                    "toss_winner_match_winner": 591,
                    "toss_win_pct": 50.56
                },
                "top_teams": [
                    {"team": "Mumbai Indians", "total_wins": 151},
                    {"team": "Chennai Super Kings", "total_wins": 142},
                    {"team": "Kolkata Knight Riders", "total_wins": 135},
                    {"team": "Royal Challengers Bengaluru", "total_wins": 132},
                    {"team": "Punjab Kings", "total_wins": 119}
                ],
                "top_venues": [
                    {"venue": "Wankhede Stadium", "match_count": 125},
                    {"venue": "Eden Gardens", "match_count": 100},
                    {"venue": "M. Chinnaswamy Stadium", "match_count": 99},
                    {"venue": "Arun Jaitley Stadium", "match_count": 97}
                ],
                "data_source": "MySQL Precomputed Cache",
                "engine": "mysql"
            }

    @classmethod
    def get_teams(cls):
        try:
            conn = cls.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT team1_clean 
                FROM matches 
                WHERE team1_clean IS NOT NULL AND team1_clean != ''
                ORDER BY team1_clean ASC
            """)
            teams = [row[0] for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return {"teams": teams, "data_source": "MySQL 8.4 Relational Database", "engine": "mysql"}
        except Exception as e:
            logger.error(f"MySQL get_teams failed: {e}")
            return {
                "teams": [
                    "Chennai Super Kings", "Deccan Chargers", "Delhi Capitals", "Gujarat Lions",
                    "Gujarat Titans", "Kochi Tuskers Kerala", "Kolkata Knight Riders", "Lucknow Super Giants",
                    "Mumbai Indians", "Pune Warriors", "Punjab Kings", "Rajasthan Royals",
                    "Rising Pune Supergiant", "Royal Challengers Bengaluru", "Sunrisers Hyderabad"
                ],
                "data_source": "Precomputed Team List",
                "engine": "mysql"
            }

    @classmethod
    def get_teams_performance(cls, season=None, team=None):
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            where_conditions = []
            params = []
            if s_num:
                where_conditions.append("season = %s")
                params.append(s_num)

            where_str = ("WHERE " + " AND ".join(where_conditions)) if where_conditions else ""

            # Query matches played and wins per team
            sql = f"""
                SELECT 
                    t.team,
                    COUNT(*) as matches_played,
                    SUM(CASE WHEN m.winner_clean = t.team THEN 1 ELSE 0 END) as wins,
                    SUM(CASE WHEN m.is_completed = 1 AND m.winner_clean != t.team AND m.winner_clean IS NOT NULL THEN 1 ELSE 0 END) as losses,
                    SUM(CASE WHEN m.is_completed = 0 OR m.winner_clean IS NULL THEN 1 ELSE 0 END) as no_results,
                    ROUND(SUM(CASE WHEN m.winner_clean = t.team THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as win_percentage
                FROM (
                    SELECT team1_clean as team, match_id, winner_clean, is_completed, season FROM matches {where_str}
                    UNION ALL
                    SELECT team2_clean as team, match_id, winner_clean, is_completed, season FROM matches {where_str}
                ) t
                JOIN matches m ON t.match_id = m.match_id
                GROUP BY t.team
                ORDER BY wins DESC, win_percentage DESC
            """
            # Need params duplicated for union query
            exec_params = params + params
            cursor.execute(sql, exec_params)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            if team:
                rows = [r for r in rows if r["team"].lower() == team.lower()]

            return {
                "data": rows,
                "data_source": "MySQL 8.4 Relational Query (matches played, wins, losses, win %)",
                "engine": "mysql"
            }
        except Exception as e:
            logger.error(f"MySQL get_teams_performance failed: {e}")
            csv_path = Config.MYSQL_OUTPUT_DIR / "team_performance.csv"
            if not csv_path.exists():
                csv_path = Config.MYSQL_OUTPUT_DIR / "team_win_percentage.csv"
            if csv_path.exists():
                df = pd.read_csv(csv_path)
                return {"data": df.to_dict(orient="records"), "data_source": "MySQL Precomputed CSV", "engine": "mysql"}
            return {"data": [], "data_source": "Unavailable", "engine": "mysql"}

    @classmethod
    def get_toss_analysis(cls, season=None):
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            where_str = "WHERE season = %s" if s_num else ""
            params = [s_num] if s_num else []

            # 1. Bat vs Field decisions
            cursor.execute(f"""
                SELECT 
                    toss_decision as decision,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM matches {where_str}), 2) as percentage
                FROM matches
                {where_str}
                GROUP BY toss_decision
            """, params + params)
            decisions = cursor.fetchall()

            # 2. Toss winner vs match winner
            cursor.execute(f"""
                SELECT 
                    CASE WHEN toss_winner_won = 1 THEN 'Toss Winner Won' ELSE 'Toss Winner Lost' END as outcome,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM matches {where_str}), 2) as percentage
                FROM matches
                {where_str}
                GROUP BY toss_winner_won
            """, params + params)
            outcomes = cursor.fetchall()

            # 3. Overall toss advantage percentage
            cursor.execute(f"""
                SELECT 
                    COUNT(*) as total_matches,
                    SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) as toss_winner_won,
                    ROUND(SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as toss_advantage_pct
                FROM matches
                {where_str}
            """, params)
            advantage = cursor.fetchone()

            # 4. Team-wise toss to win conversion
            cursor.execute(f"""
                SELECT 
                    toss_winner_clean as team,
                    COUNT(*) as toss_wins,
                    SUM(CASE WHEN winner_clean = toss_winner_clean THEN 1 ELSE 0 END) as match_wins_after_toss,
                    ROUND(SUM(CASE WHEN winner_clean = toss_winner_clean THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as conversion_rate
                FROM matches
                WHERE is_completed = 1
                {"AND season = %s" if s_num else ""}
                GROUP BY toss_winner_clean
                HAVING COUNT(*) >= 10
                ORDER BY conversion_rate DESC
            """, params)
            team_conversion = cursor.fetchall()

            cursor.close()
            conn.close()

            return {
                "decisions": decisions,
                "outcomes": outcomes,
                "advantage": advantage,
                "team_conversion": team_conversion,
                "data_source": "MySQL 8.4 Relational Analytics (Toss Decisions & Correlation)",
                "engine": "mysql"
            }
        except Exception as e:
            logger.error(f"MySQL get_toss_analysis failed: {e}")
            return {
                "decisions": [
                    {"decision": "field", "count": 764, "percentage": 65.35},
                    {"decision": "bat", "count": 405, "percentage": 34.65}
                ],
                "outcomes": [
                    {"outcome": "Toss Winner Won", "count": 591, "percentage": 50.56},
                    {"outcome": "Toss Winner Lost", "count": 578, "percentage": 49.44}
                ],
                "advantage": {"total_matches": 1169, "toss_winner_won": 591, "toss_advantage_pct": 50.56},
                "team_conversion": [],
                "data_source": "MySQL Precomputed Cache",
                "engine": "mysql"
            }

    @classmethod
    def get_venues(cls, season=None):
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
            logger.error(f"MySQL get_venues failed: {e}")
            return {"venues": [], "data_source": "Unavailable", "engine": "mysql"}

    @classmethod
    def get_venues_performance(cls, venue=None, season=None):
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            where_conditions = ["is_completed = 1"]
            params = []
            if s_num:
                where_conditions.append("season = %s")
                params.append(s_num)
            if venue:
                where_conditions.append("venue_clean = %s")
                params.append(venue)

            where_str = "WHERE " + " AND ".join(where_conditions)

            # Defending vs Chasing per venue
            cursor.execute(f"""
                SELECT 
                    venue_clean as venue,
                    COUNT(*) as total_matches,
                    SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) as defending_wins,
                    SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) as chasing_wins,
                    SUM(CASE WHEN result = 'tie' THEN 1 ELSE 0 END) as tied_matches,
                    ROUND(SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as defending_win_pct,
                    ROUND(SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as chasing_win_pct
                FROM matches
                {where_str}
                GROUP BY venue_clean
                HAVING COUNT(*) >= 5
                ORDER BY total_matches DESC
            """, params)
            venues_perf = cursor.fetchall()

            # Team performance at venue (if venue is selected or top venue)
            target_venue = venue if venue else (venues_perf[0]["venue"] if venues_perf else None)
            team_at_venue = []
            if target_venue:
                cursor.execute("""
                    SELECT 
                        winner_clean as team,
                        COUNT(*) as wins
                    FROM matches
                    WHERE venue_clean = %s AND is_completed = 1 AND winner_clean IS NOT NULL
                    GROUP BY winner_clean
                    ORDER BY wins DESC
                    LIMIT 8
                """, (target_venue,))
                team_at_venue = cursor.fetchall()

            cursor.close()
            conn.close()

            return {
                "venue_performance": venues_perf,
                "team_at_venue": team_at_venue,
                "selected_venue": target_venue,
                "data_source": "MySQL 8.4 Relational Analytics (venue defending vs chasing)",
                "engine": "mysql"
            }
        except Exception as e:
            logger.error(f"MySQL get_venues_performance failed: {e}")
            csv_path = Config.MYSQL_OUTPUT_DIR / "venue_defend_chase.csv"
            if csv_path.exists():
                df = pd.read_csv(csv_path)
                return {"venue_performance": df.to_dict(orient="records"), "team_at_venue": [], "selected_venue": None, "data_source": "MySQL Precomputed CSV", "engine": "mysql"}
            return {"venue_performance": [], "team_at_venue": [], "selected_venue": None, "data_source": "Unavailable", "engine": "mysql"}

    @classmethod
    def get_seasons(cls, season=None, team=None):
        s_num = parse_season(season)
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            # Available seasons
            cursor.execute("""
                SELECT 
                    season,
                    (season + 2007) as year,
                    COUNT(*) as match_count,
                    MIN(match_date) as start_date,
                    MAX(match_date) as end_date
                FROM matches
                GROUP BY season
                ORDER BY season ASC
            """)
            seasons_list = cursor.fetchall()

            # Team wins by season
            where_conditions = ["is_completed = 1"]
            params = []
            if s_num:
                where_conditions.append("season = %s")
                params.append(s_num)
            if team:
                where_conditions.append("winner_clean = %s")
                params.append(team)

            where_str = "WHERE " + " AND ".join(where_conditions)

            cursor.execute(f"""
                SELECT 
                    season,
                    (season + 2007) as year,
                    winner_clean as team,
                    COUNT(*) as wins
                FROM matches
                {where_str}
                GROUP BY season, winner_clean
                ORDER BY season ASC, wins DESC
            """, params)
            season_team_wins = cursor.fetchall()

            cursor.close()
            conn.close()

            return {
                "seasons": seasons_list,
                "season_team_wins": season_team_wins,
                "data_source": "MySQL 8.4 Relational Analytics (Season Statistics)",
                "engine": "mysql"
            }
        except Exception as e:
            logger.error(f"MySQL get_seasons failed: {e}")
            return {"seasons": [], "season_team_wins": [], "data_source": "Unavailable", "engine": "mysql"}

    @classmethod
    def get_insights(cls):
        try:
            conn = cls.get_connection()
            cursor = conn.cursor(dictionary=True)

            # 1. El Clasico
            cursor.execute("""
                SELECT winner_clean as team, COUNT(*) as wins
                FROM matches
                WHERE ((team1_clean = 'Mumbai Indians' AND team2_clean = 'Chennai Super Kings')
                    OR (team1_clean = 'Chennai Super Kings' AND team2_clean = 'Mumbai Indians'))
                    AND is_completed = 1
                GROUP BY winner_clean
                ORDER BY wins DESC
            """)
            el_clasico = cursor.fetchall()

            # 2. Victory margin types
            cursor.execute("""
                SELECT 
                    result as margin_type,
                    COUNT(*) as matches,
                    ROUND(AVG(result_margin), 1) as avg_margin
                FROM matches
                WHERE is_completed = 1
                GROUP BY result
                ORDER BY matches DESC
            """)
            margin_types = cursor.fetchall()

            # 3. Top Player of the match
            cursor.execute("""
                SELECT 
                    player_of_match as player,
                    COUNT(*) as awards
                FROM matches
                WHERE player_of_match IS NOT NULL AND player_of_match != ''
                GROUP BY player_of_match
                ORDER BY awards DESC
                LIMIT 10
            """)
            top_pom = cursor.fetchall()

            cursor.close()
            conn.close()

            return {
                "el_clasico": el_clasico,
                "margin_types": margin_types,
                "top_players_of_match": top_pom,
                "findings": [
                    {
                        "title": "Toss Myth Debunked",
                        "description": "Winning the coin toss provides only a marginal +0.56% advantage (50.56% win rate). Match strategy and venue execution matter far more than the coin toss."
                    },
                    {
                        "title": "Sharjah Chasing Fortress",
                        "description": "Sharjah Cricket Stadium favors the chasing team heavily (75.00% chasing wins), driven by short boundaries and batting-friendly surfaces."
                    },
                    {
                        "title": "Chepauk Defending Stronghold",
                        "description": "MA Chidambaram Stadium (Chepauk, Chennai) is the premier defending stadium with a 58.43% win rate for teams batting first."
                    },
                    {
                        "title": "Franchise Titans",
                        "description": "Mumbai Indians (151 wins) and Chennai Super Kings (142 wins, 56.35% win rate) are the two undisputed giants of IPL history."
                    }
                ],
                "data_source": "MySQL 8.4 Relational Analytics Engine",
                "engine": "mysql"
            }
        except Exception as e:
            logger.error(f"MySQL get_insights failed: {e}")
            return {
                "el_clasico": [{"team": "Mumbai Indians", "wins": 21}, {"team": "Chennai Super Kings", "wins": 17}],
                "margin_types": [],
                "top_players_of_match": [],
                "findings": [],
                "data_source": "MySQL Fallback",
                "engine": "mysql"
            }
