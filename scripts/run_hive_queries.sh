#!/usr/bin/env bash
# scripts/run_hive_queries.sh
# Execute Apache Hive queries and export verified analytical datasets.

set -e

if [ -f "$HOME/env.sh" ]; then
    . "$HOME/env.sh"
fi

HDFS_BIN="${HADOOP_HOME:-/opt/hadoop}/bin/hdfs"
HIVE_BIN="${HIVE_HOME:-/usr/local/hive}/bin/hive"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$PROJECT_DIR/output/hive"
HIVE_DIR="$PROJECT_DIR/hive"

mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "APACHE HIVE QUERIES EXECUTION"
echo "=========================================="

# 1. Ensure dedicated HDFS folder exists for Hive table
echo "1. Preparing HDFS directory for Hive table (/ipl_project/hive/matches/)..."
"$HDFS_BIN" dfs -mkdir -p /ipl_project/hive/matches
"$HDFS_BIN" dfs -cp -f /ipl_project/processed/ipl_pig_hive.tsv /ipl_project/hive/matches/ipl_pig_hive.tsv
echo "  [OK] HDFS source file ready."

# 2. Initialize Hive schema
echo -e "\n2. Applying Hive schema (hive/schema.hql)..."
"$HIVE_BIN" -f "$HIVE_DIR/schema.hql"

# 3. Execute Team Analysis
echo -e "\n3. Executing hive/team_analysis.hql..."
echo "team,matches_played,total_wins,win_percentage" > "$OUTPUT_DIR/team_performance.csv"
"$HIVE_BIN" -S -e "
USE ipl_analytics;
SET mapreduce.task.io.sort.mb=20;
SELECT p.team, p.matches_played, COALESCE(w.total_wins, 0) AS total_wins,
       ROUND(100.0 * COALESCE(w.total_wins, 0) / p.matches_played, 2) AS win_percentage
FROM (
    SELECT team, COUNT(*) AS matches_played
    FROM matches
    LATERAL VIEW explode(array(team1, team2)) t AS team
    WHERE team IS NOT NULL AND team <> ''
    GROUP BY team
) p
LEFT JOIN (
    SELECT winner AS team, COUNT(*) AS total_wins
    FROM matches
    WHERE winner IS NOT NULL AND winner <> 'NONE'
    GROUP BY winner
) w ON p.team = w.team
ORDER BY win_percentage DESC, total_wins DESC;
" | tr '\t' ',' >> "$OUTPUT_DIR/team_performance.csv"
echo "  [OK] Saved to $OUTPUT_DIR/team_performance.csv"

# 4. Execute Toss Analysis
echo -e "\n4. Executing hive/toss_analysis.hql..."
echo "team,toss_wins,match_wins_after_toss,toss_to_win_conversion_pct" > "$OUTPUT_DIR/toss_advantage.csv"
"$HIVE_BIN" -S -e "
USE ipl_analytics;
SET mapreduce.task.io.sort.mb=20;
SELECT toss_winner AS team, COUNT(*) AS toss_wins,
       SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) AS match_wins_after_toss,
       ROUND(100.0 * SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS toss_to_win_conversion_pct
FROM matches
WHERE toss_winner IS NOT NULL AND toss_winner <> ''
GROUP BY toss_winner
ORDER BY match_wins_after_toss DESC;
" | tr '\t' ',' >> "$OUTPUT_DIR/toss_advantage.csv"
echo "  [OK] Saved to $OUTPUT_DIR/toss_advantage.csv"

# 5. Execute Venue Analysis
echo -e "\n5. Executing hive/venue_analysis.hql..."
echo "venue,total_matches,defending_wins,chasing_wins,tied_matches,defending_win_pct,chasing_win_pct" > "$OUTPUT_DIR/venue_defend_chase.csv"
"$HIVE_BIN" -S -e "
USE ipl_analytics;
SET mapreduce.task.io.sort.mb=20;
SELECT venue, COUNT(*) AS total_matches,
       SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) AS defending_wins,
       SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) AS chasing_wins,
       SUM(CASE WHEN result = 'tie' THEN 1 ELSE 0 END) AS tied_matches,
       ROUND(100.0 * SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS defending_win_pct,
       ROUND(100.0 * SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS chasing_win_pct
FROM matches
GROUP BY venue
HAVING total_matches >= 10
ORDER BY total_matches DESC;
" | tr '\t' ',' >> "$OUTPUT_DIR/venue_defend_chase.csv"
echo "  [OK] Saved to $OUTPUT_DIR/venue_defend_chase.csv"

echo -e "\n=========================================="
echo "APACHE HIVE QUERIES COMPLETED SUCCESSFULLY"
echo "=========================================="
ls -lh "$OUTPUT_DIR"
