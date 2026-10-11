#!/usr/bin/env python3
"""
scripts/prepare_ipl.py
Comprehensive Data Preparation Pipeline for IPL Big Data Analysis.

Produces:
1. data/processed/ipl_clean.csv (Full cleaned dataset with surrogate match_id and canonical team names)
2. data/processed/ipl_pig_hive.csv (Safe delimiter-separated flat file for Pig and Hive)
3. data/semi_structured/matches.jsonl (Structured JSON Lines for MongoDB import)
4. data/semi_structured/match_summaries.txt (Text data for Hadoop/Pig text analysis)
5. data/processed/data_quality_report.json (Comprehensive audit report)
"""

import csv
import json
import os
import re
from datetime import datetime

# Documented explicit team name standardization mapping
TEAM_STANDARDIZATION_MAP = {
    "Delhi Daredevils": "Delhi Capitals",
    "Kings XI Punjab": "Punjab Kings",
    "Rising Pune Supergiants": "Rising Pune Supergiant",
    "Royal Challengers Bangalore": "Royal Challengers Bengaluru"
}

# Venue cleaning mapping (merges duplicate names with city suffixes)
VENUE_STANDARDIZATION_MAP = {
    "M Chinnaswamy Stadium": "M. Chinnaswamy Stadium",
    "M.Chinnaswamy Stadium": "M. Chinnaswamy Stadium",
    "M Chinnaswamy Stadium, Bangalore": "M. Chinnaswamy Stadium",
    "M.Chinnaswamy Stadium, Bengaluru": "M. Chinnaswamy Stadium",
    "M Chinnaswamy Stadium, Bengaluru": "M. Chinnaswamy Stadium",
    "Wankhede Stadium, Mumbai": "Wankhede Stadium",
    "Brabourne Stadium, Mumbai": "Brabourne Stadium",
    "Dr DY Patil Sports Academy, Mumbai": "Dr DY Patil Sports Academy",
    "Dr DY Patil Sports Academy, Navi Mumbai": "Dr DY Patil Sports Academy",
    "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium, Visakhapatnam": "ACA-VDCA Cricket Stadium",
    "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium": "ACA-VDCA Cricket Stadium",
    "Punjab Cricket Association Stadium, Mohali": "IS Bindra Stadium, Mohali",
    "Punjab Cricket Association IS Bindra Stadium, Mohali": "IS Bindra Stadium, Mohali",
    "Punjab Cricket Association IS Bindra Stadium, Mohali, Chandigarh": "IS Bindra Stadium, Mohali",
    "Punjab Cricket Association IS Bindra Stadium, Chandigarh": "IS Bindra Stadium, Mohali",
    "Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur": "Maharaja Yadavindra Singh Stadium, Mullanpur",
    "Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur, Mohali": "Maharaja Yadavindra Singh Stadium, Mullanpur",
    "Maharaja Yadavindra Singh International Cricket Stadium, New Chandigarh": "Maharaja Yadavindra Singh Stadium, Mullanpur",
    "Rajiv Gandhi International Stadium, Uppal": "Rajiv Gandhi International Stadium",
    "Rajiv Gandhi International Stadium, Uppal, Hyderabad": "Rajiv Gandhi International Stadium",
    "MA Chidambaram Stadium, Chepauk": "MA Chidambaram Stadium",
    "MA Chidambaram Stadium, Chepauk, Chennai": "MA Chidambaram Stadium",
    "Feroz Shah Kotla": "Arun Jaitley Stadium",
    "Arun Jaitley Stadium, Delhi": "Arun Jaitley Stadium",
    "Eden Gardens, Kolkata": "Eden Gardens",
    "Sawai Mansingh Stadium, Jaipur": "Sawai Mansingh Stadium",
    "Narendra Modi Stadium, Ahmedabad": "Narendra Modi Stadium",
    "Sardar Patel Stadium, Motera": "Narendra Modi Stadium",
    "Maharashtra Cricket Association Stadium, Pune": "MCA Stadium, Pune",
    "Subrata Roy Sahara Stadium": "MCA Stadium, Pune",
    "Subrata Roy Sahara Stadium, Pune": "MCA Stadium, Pune",
    "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow": "Ekana Cricket Stadium, Lucknow",
    "Himachal Pradesh Cricket Association Stadium, Dharamsala": "HPCA Stadium, Dharamsala",
    "Barsapara Cricket Stadium, Guwahati": "Barsapara Cricket Stadium",
    "Shaheed Veer Narayan Singh International Stadium, Raipur": "Shaheed Veer Narayan Singh Stadium, Raipur",
    "Zayed Cricket Stadium, Abu Dhabi": "Sheikh Zayed Stadium"
}

def clean_team_name(name):
    if not name:
        return ""
    name = name.strip()
    return TEAM_STANDARDIZATION_MAP.get(name, name)

def clean_venue_name(name):
    if not name:
        return ""
    name = name.strip()
    return VENUE_STANDARDIZATION_MAP.get(name, name)

def prepare_pipeline(raw_csv_path, base_dir):
    print(f"Reading raw data from: {raw_csv_path}")
    with open(raw_csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        raw_rows = list(reader)

    input_count = len(raw_rows)
    print(f"Loaded {input_count} records.")

    clean_rows = []
    jsonl_rows = []
    text_summaries = []
    pig_hive_rows = []

    transformations_count = 0
    missing_winner_count = 0
    missing_city_count = 0
    tied_matches = 0
    no_result_matches = 0

    for idx, r in enumerate(raw_rows, start=1):
        match_id = idx
        team1_raw = r.get("team1", "").strip()
        team2_raw = r.get("team2", "").strip()
        toss_winner_raw = r.get("toss_winner", "").strip()
        winner_raw = r.get("winner", "").strip()
        toss_decision = r.get("toss_decision", "").strip().lower()
        match_date = r.get("match_date", "").strip()
        venue_raw = r.get("venue", "").strip()
        city_raw = r.get("city", "").strip()
        season_str = r.get("season", "").strip()
        match_number_str = r.get("match_number", "").strip()
        match_type = r.get("match_type", "").strip()
        result = r.get("result", "").strip().lower()
        result_margin_str = r.get("result_margin", "").strip()
        target_runs_str = r.get("target_runs", "").strip()
        target_overs_str = r.get("target_overs", "").strip()
        super_over = r.get("super_over", "N").strip().upper()
        player_of_match = r.get("player_of_match", "").strip()

        # Parse player lists
        t1_players = [p.strip() for p in r.get("team1_players", "").split(",") if p.strip()]
        t2_players = [p.strip() for p in r.get("team2_players", "").split(",") if p.strip()]

        # Standardized names
        team1_clean = clean_team_name(team1_raw)
        team2_clean = clean_team_name(team2_raw)
        toss_winner_clean = clean_team_name(toss_winner_raw)
        winner_clean = clean_team_name(winner_raw) if winner_raw else ""
        venue_clean = clean_venue_name(venue_raw)

        if team1_clean != team1_raw or team2_clean != team2_raw:
            transformations_count += 1

        # Check numeric conversions safely
        try:
            season = int(season_str) if season_str else None
        except ValueError:
            season = None

        try:
            match_number = int(match_number_str) if match_number_str else None
        except ValueError:
            match_number = None

        try:
            result_margin = float(result_margin_str) if result_margin_str else None
        except ValueError:
            result_margin = None

        try:
            target_runs = float(target_runs_str) if target_runs_str else None
        except ValueError:
            target_runs = None

        try:
            target_overs = float(target_overs_str) if target_overs_str else None
        except ValueError:
            target_overs = None

        # Analyze outcomes
        is_completed = (result in ["runs", "wickets", "tie"] and winner_raw != "")
        if result == "tie":
            tied_matches += 1
        elif result in ["no result", "abandoned"]:
            no_result_matches += 1

        if not winner_raw:
            missing_winner_count += 1

        if not city_raw:
            missing_city_count += 1

        toss_winner_won = None
        if winner_raw:
            toss_winner_won = (toss_winner_raw == winner_raw)

        # 1. Cleaned Row for MySQL / CSV
        clean_row = {
            "match_id": match_id,
            "team1": team1_raw,
            "team2": team2_raw,
            "team1_clean": team1_clean,
            "team2_clean": team2_clean,
            "match_date": match_date,
            "toss_winner": toss_winner_raw,
            "toss_winner_clean": toss_winner_clean,
            "toss_decision": toss_decision,
            "winner": winner_raw,
            "winner_clean": winner_clean,
            "player_of_match": player_of_match,
            "venue": venue_raw,
            "venue_clean": venue_clean,
            "city": city_raw,
            "season": season if season is not None else "",
            "match_number": match_number if match_number is not None else "",
            "match_type": match_type,
            "result": result,
            "result_margin": result_margin if result_margin is not None else "",
            "target_runs": target_runs if target_runs is not None else "",
            "target_overs": target_overs if target_overs is not None else "",
            "super_over": super_over,
            "is_completed": 1 if is_completed else 0,
            "toss_winner_won": 1 if toss_winner_won is True else (0 if toss_winner_won is False else "")
        }
        clean_rows.append(clean_row)

        # 2. Delimiter-safe Flat Row for Apache Pig and Apache Hive
        # In this file, players are joined with semicolon (;) instead of comma (,)
        # and venue has no internal commas. We use tab delimiter (\t) for flawless parsing.
        pig_hive_row = [
            str(match_id),
            team1_clean,
            team2_clean,
            match_date,
            toss_winner_clean,
            toss_decision,
            winner_clean if winner_clean else "NONE",
            player_of_match if player_of_match else "NONE",
            venue_clean,
            city_raw if city_raw else "UNKNOWN",
            str(season if season is not None else 0),
            match_type,
            result if result else "unknown",
            str(result_margin if result_margin is not None else 0.0),
            str(target_runs if target_runs is not None else 0.0),
            str(target_overs if target_overs is not None else 0.0),
            super_over,
            "1" if toss_winner_won is True else "0",
            ";".join(t1_players),
            ";".join(t2_players)
        ]
        pig_hive_rows.append(pig_hive_row)

        # 3. MongoDB JSON Document
        doc = {
            "match_id": match_id,
            "match_date": match_date,
            "season": season,
            "match_number": match_number,
            "match_type": match_type,
            "teams": {
                "team1_raw": team1_raw,
                "team2_raw": team2_raw,
                "team1": team1_clean,
                "team2": team2_clean,
                "team1_players": t1_players,
                "team2_players": t2_players
            },
            "toss": {
                "toss_winner_raw": toss_winner_raw,
                "toss_winner": toss_winner_clean,
                "decision": toss_decision
            },
            "venue": {
                "name_raw": venue_raw,
                "name": venue_clean,
                "city": city_raw if city_raw else None
            },
            "outcome": {
                "result": result,
                "result_margin": result_margin,
                "winner_raw": winner_raw if winner_raw else None,
                "winner": winner_clean if winner_clean else None,
                "player_of_match": player_of_match if player_of_match else None,
                "super_over": (super_over == "Y"),
                "is_completed": is_completed,
                "toss_winner_won_match": toss_winner_won
            },
            "target": {
                "runs": target_runs,
                "overs": target_overs
            }
        }
        jsonl_rows.append(doc)

        # 4. Text Summary for Hadoop/Pig Text Analysis
        win_desc = f"won by {winner_clean}" if winner_clean else f"ended with result '{result}'"
        margin_desc = f" ({result_margin} {result})" if result_margin else ""
        pom_desc = f", Player of the Match: {player_of_match}" if player_of_match else ""
        summary_text = (
            f"Match {match_id}: On {match_date} during IPL Season {season}, {team1_clean} played against {team2_clean} "
            f"at {venue_clean}. {toss_winner_clean} won the toss and opted to {toss_decision}. "
            f"The match was {win_desc}{margin_desc}{pom_desc}."
        )
        text_summaries.append(summary_text)

    # File paths
    processed_dir = os.path.join(base_dir, "data", "processed")
    semi_dir = os.path.join(base_dir, "data", "semi_structured")
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(semi_dir, exist_ok=True)

    clean_csv_path = os.path.join(processed_dir, "ipl_clean.csv")
    pig_hive_tsv_path = os.path.join(processed_dir, "ipl_pig_hive.tsv")
    pig_hive_csv_path = os.path.join(processed_dir, "ipl_pig_hive.csv")
    jsonl_path = os.path.join(semi_dir, "matches.jsonl")
    text_path = os.path.join(semi_dir, "match_summaries.txt")
    report_path = os.path.join(processed_dir, "data_quality_report.json")

    # Write ipl_clean.csv
    with open(clean_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(clean_rows[0].keys()))
        writer.writeheader()
        writer.writerows(clean_rows)
    print(f"Saved clean dataset to {clean_csv_path} ({len(clean_rows)} rows)")

    # Write delimiter-safe TSV and CSV for Pig & Hive
    pig_hive_header = [
        "match_id", "team1", "team2", "match_date", "toss_winner", "toss_decision",
        "winner", "player_of_match", "venue", "city", "season", "match_type",
        "result", "result_margin", "target_runs", "target_overs", "super_over",
        "toss_winner_won", "team1_players", "team2_players"
    ]
    with open(pig_hive_tsv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(pig_hive_header)
        writer.writerows(pig_hive_rows)
    print(f"Saved Pig/Hive safe TSV to {pig_hive_tsv_path}")

    # Also save a standard comma CSV with semicolon players for tools preferring commas
    with open(pig_hive_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(pig_hive_header)
        writer.writerows(pig_hive_rows)
    print(f"Saved Pig/Hive safe CSV to {pig_hive_csv_path}")

    # Write matches.jsonl
    with open(jsonl_path, "w", encoding="utf-8") as f:
        for doc in jsonl_rows:
            f.write(json.dumps(doc) + "\n")
    print(f"Saved JSON Lines to {jsonl_path} ({len(jsonl_rows)} docs)")

    # Write match_summaries.txt
    with open(text_path, "w", encoding="utf-8") as f:
        for text in text_summaries:
            f.write(text + "\n")
    print(f"Saved text summaries to {text_path} ({len(text_summaries)} lines)")

    # Generate Data Quality Report
    report = {
        "pipeline_execution_timestamp": datetime.now().isoformat(),
        "input_file": raw_csv_path,
        "input_records": input_count,
        "output_records": len(clean_rows),
        "records_discrepancy": 0,
        "missing_winner_records": missing_winner_count,
        "missing_city_records": missing_city_count,
        "tied_matches_identified": tied_matches,
        "no_result_abandoned_matches": no_result_matches,
        "team_name_standardizations_applied": len(TEAM_STANDARDIZATION_MAP),
        "team_standardization_map": TEAM_STANDARDIZATION_MAP,
        "venue_standardization_count": len(VENUE_STANDARDIZATION_MAP),
        "output_artifacts": {
            "clean_csv": clean_csv_path,
            "pig_hive_tsv": pig_hive_tsv_path,
            "pig_hive_csv": pig_hive_csv_path,
            "jsonl_file": jsonl_path,
            "text_summaries": text_path
        }
    }
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"Saved data quality report to {report_path}")

    return report

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_csv = os.path.join(base_dir, "data", "raw", "ipl.csv")
    prepare_pipeline(raw_csv, base_dir)
