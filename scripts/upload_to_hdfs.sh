#!/usr/bin/env bash
# scripts/upload_to_hdfs.sh
# Idempotent upload script for IPL Big Data project HDFS directory structure and datasets.

set -e

# Source environment
if [ -f "$HOME/env.sh" ]; then
    . "$HOME/env.sh"
fi

HDFS_BIN="${HADOOP_HOME:-/opt/hadoop}/bin/hdfs"

if [ ! -x "$HDFS_BIN" ]; then
    echo "Error: HDFS binary not found at $HDFS_BIN" >&2
    exit 1
fi

echo "=========================================="
echo "HDFS UPLOAD & STORAGE VERIFICATION"
echo "=========================================="

# Test HDFS cluster connectivity
if ! "$HDFS_BIN" dfs -test -d / 2>/dev/null; then
    echo "Error: Cannot connect to HDFS. Is NameNode running on hdfs://localhost:9000?" >&2
    exit 1
fi
echo "HDFS cluster connection verified successfully."

# 1. Create HDFS directories
HDFS_DIRS=(
    "/ipl_project/raw"
    "/ipl_project/processed"
    "/ipl_project/sql"
    "/ipl_project/semi_structured"
    "/ipl_project/pig"
    "/ipl_project/hive"
    "/ipl_project/output"
)

echo -e "\n1. Creating HDFS directories..."
for dir in "${HDFS_DIRS[@]}"; do
    "$HDFS_BIN" dfs -mkdir -p "$dir"
    echo "  [OK] $dir"
done

# 2. Upload files
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

FILES_TO_UPLOAD=(
    "$PROJECT_DIR/data/raw/ipl.csv:/ipl_project/raw/ipl.csv"
    "$PROJECT_DIR/data/processed/ipl_clean.csv:/ipl_project/processed/ipl_clean.csv"
    "$PROJECT_DIR/data/processed/ipl_pig_hive.tsv:/ipl_project/processed/ipl_pig_hive.tsv"
    "$PROJECT_DIR/data/processed/ipl_pig_hive.csv:/ipl_project/processed/ipl_pig_hive.csv"
    "$PROJECT_DIR/data/semi_structured/matches.jsonl:/ipl_project/semi_structured/matches.jsonl"
    "$PROJECT_DIR/data/semi_structured/match_summaries.txt:/ipl_project/semi_structured/match_summaries.txt"
)

echo -e "\n2. Uploading datasets to HDFS..."
for item in "${FILES_TO_UPLOAD[@]}"; do
    local_file="${item%%:*}"
    hdfs_dest="${item##*:}"
    
    if [ ! -f "$local_file" ]; then
        echo "  [ERROR] Local file not found: $local_file" >&2
        exit 1
    fi

    "$HDFS_BIN" dfs -put -f "$local_file" "$hdfs_dest"
    
    # Verification with hdfs dfs -test -e
    if "$HDFS_BIN" dfs -test -e "$hdfs_dest"; then
        size=$("$HDFS_BIN" dfs -du -h "$hdfs_dest" | awk '{print $1 $2}')
        echo "  [VERIFIED] $hdfs_dest ($size)"
    else
        echo "  [FAILED] $hdfs_dest was not stored properly!" >&2
        exit 1
    fi
done

echo -e "\n3. Complete HDFS Directory Listing:"
"$HDFS_BIN" dfs -ls -R /ipl_project

echo -e "\n4. Sample Data Inspection (first 2 records of processed TSV from HDFS):"
"$HDFS_BIN" dfs -cat /ipl_project/processed/ipl_pig_hive.tsv | head -n 3

echo -e "\n=========================================="
echo "HDFS STORAGE VALIDATION COMPLETED SUCCESSFULLY"
echo "=========================================="
