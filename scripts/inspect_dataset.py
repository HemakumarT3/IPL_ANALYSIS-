#!/usr/bin/env python3
"""
scripts/inspect_dataset.py
Inspect the raw IPL CSV dataset and generate an automated data quality summary.
"""

import csv
import json
import os
import sys
from collections import Counter
from datetime import datetime

def inspect_dataset(csv_path, output_json=None):
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}", file=sys.stderr)
        sys.exit(1)

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    total_rows = len(rows)
    print(f"Total Match Records: {total_rows}")
    print(f"Total Columns: {len(fieldnames)}")
    print(f"Columns: {fieldnames}\n")

    # Missing values
    missing = {col: 0 for col in fieldnames}
    for r in rows:
        for col in fieldnames:
            val = r.get(col)
            if val is None or val.strip() == "":
                missing[col] += 1

    print("Missing Values:")
    for col, count in missing.items():
        if count > 0:
            pct = (count / total_rows) * 100
            print(f"  - {col}: {count} ({pct:.2f}%)")

    # Team extraction
    teams = set()
    for r in rows:
        for col in ["team1", "team2", "toss_winner", "winner"]:
            t = r.get(col, "").strip()
            if t:
                teams.add(t)

    # Duplicates check by date and playing teams
    seen_matches = set()
    duplicates = 0
    for r in rows:
        m_key = (r.get("match_date"), r.get("team1"), r.get("team2"))
        if m_key in seen_matches:
            duplicates += 1
        seen_matches.add(m_key)

    # Results distribution
    results_dist = dict(Counter(r.get("result", "").strip() for r in rows))
    super_over_dist = dict(Counter(r.get("super_over", "").strip() for r in rows))
    toss_decision_dist = dict(Counter(r.get("toss_decision", "").strip() for r in rows))

    # Seasons
    seasons = sorted(list(set(r.get("season", "").strip() for r in rows if r.get("season"))), key=lambda x: int(x) if x.isdigit() else x)

    # Venues
    venues = dict(Counter(r.get("venue", "").strip() for r in rows if r.get("venue")))

    summary = {
        "dataset_path": csv_path,
        "total_records": total_rows,
        "total_columns": len(fieldnames),
        "columns": fieldnames,
        "missing_values": missing,
        "duplicate_count": duplicates,
        "unique_teams_count": len(teams),
        "unique_teams": sorted(list(teams)),
        "unique_venues_count": len(venues),
        "results_distribution": results_dist,
        "super_over_distribution": super_over_dist,
        "toss_decision_distribution": toss_decision_dist,
        "seasons_count": len(seasons),
        "seasons": seasons
    }

    if output_json:
        os.makedirs(os.path.dirname(output_json), exist_ok=True)
        with open(output_json, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        print(f"\nInspection summary saved to: {output_json}")

    return summary

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_csv = os.path.join(base_dir, "data", "raw", "ipl.csv")
    out_json = os.path.join(base_dir, "data", "processed", "inspection_summary.json")
    inspect_dataset(raw_csv, out_json)
