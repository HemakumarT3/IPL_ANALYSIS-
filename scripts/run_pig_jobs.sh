#!/usr/bin/env bash
# scripts/run_pig_jobs.sh
# Execute Apache Pig Latin scripts on HDFS data and extract verified analytical outputs.

set -e

if [ -f "$HOME/env.sh" ]; then
    . "$HOME/env.sh"
fi

HDFS_BIN="${HADOOP_HOME:-/opt/hadoop}/bin/hdfs"
PIG_BIN="${PIG_HOME:-/usr/local/pig}/bin/pig"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$PROJECT_DIR/output/pig"
PIG_DIR="$PROJECT_DIR/pig"

mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "APACHE PIG JOBS EXECUTION"
echo "=========================================="

# Clean previous Pig output directories in HDFS
echo "1. Cleaning previous Pig outputs in HDFS..."
"$HDFS_BIN" dfs -rm -r -f /ipl_project/pig/team_performance /ipl_project/pig/toss_advantage /ipl_project/pig/venue_defend_chase /ipl_project/pig/text_wordcount 2>/dev/null || true

# 1. Run team_analysis.pig
echo -e "\n2. Executing pig/team_analysis.pig..."
"$PIG_BIN" -x local "$PIG_DIR/team_analysis.pig"
echo "team,matches_played,total_wins,win_percentage" > "$OUTPUT_DIR/team_performance.csv"
"$HDFS_BIN" dfs -cat /ipl_project/pig/team_performance/part* >> "$OUTPUT_DIR/team_performance.csv"
echo "  [OK] Saved to $OUTPUT_DIR/team_performance.csv"

# 2. Run toss_analysis.pig
echo -e "\n3. Executing pig/toss_analysis.pig..."
"$PIG_BIN" -x local "$PIG_DIR/toss_analysis.pig"
echo "team,toss_wins,match_wins_after_toss,toss_to_win_pct" > "$OUTPUT_DIR/toss_advantage.csv"
"$HDFS_BIN" dfs -cat /ipl_project/pig/toss_advantage/part* >> "$OUTPUT_DIR/toss_advantage.csv"
echo "  [OK] Saved to $OUTPUT_DIR/toss_advantage.csv"

# 3. Run venue_analysis.pig
echo -e "\n4. Executing pig/venue_analysis.pig..."
"$PIG_BIN" -x local "$PIG_DIR/venue_analysis.pig"
echo "venue,total_matches,defending_wins,chasing_wins,tied_matches,defending_win_pct,chasing_win_pct" > "$OUTPUT_DIR/venue_defend_chase.csv"
"$HDFS_BIN" dfs -cat /ipl_project/pig/venue_defend_chase/part* >> "$OUTPUT_DIR/venue_defend_chase.csv"
echo "  [OK] Saved to $OUTPUT_DIR/venue_defend_chase.csv"

# 4. Run text_analysis.pig
echo -e "\n5. Executing pig/text_analysis.pig..."
"$PIG_BIN" -x local "$PIG_DIR/text_analysis.pig"
echo "word,frequency" > "$OUTPUT_DIR/text_wordcount.csv"
"$HDFS_BIN" dfs -cat /ipl_project/pig/text_wordcount/part* >> "$OUTPUT_DIR/text_wordcount.csv"
echo "  [OK] Saved to $OUTPUT_DIR/text_wordcount.csv"

echo -e "\n=========================================="
echo "APACHE PIG JOBS COMPLETED SUCCESSFULLY"
echo "=========================================="
ls -lh "$OUTPUT_DIR"
