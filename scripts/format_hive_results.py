import subprocess
import csv
from pathlib import Path

BASE_DIR = Path("/home/hemakumar_t3/ipl-bigdata")
HIVE_DIR = BASE_DIR / "hive"
OUTPUT_DIR = BASE_DIR / "output" / "hive"

QUERIES = [
    {
        "file": HIVE_DIR / "team_analysis.hql",
        "header": ["team", "matches_played", "total_wins", "win_percentage"],
        "output": OUTPUT_DIR / "team_performance.csv"
    },
    {
        "file": HIVE_DIR / "toss_analysis.hql",
        "header": ["team", "toss_wins", "match_wins_after_toss", "toss_to_win_conversion_pct"],
        "output": OUTPUT_DIR / "toss_advantage.csv"
    },
    {
        "file": HIVE_DIR / "venue_analysis.hql",
        "header": ["venue", "total_matches", "defending_wins", "chasing_wins", "tied_matches", "defending_win_pct", "chasing_win_pct"],
        "output": OUTPUT_DIR / "venue_defend_chase.csv"
    }
]

def run_and_format():
    for q in QUERIES:
        print(f"Executing and formatting {q['file'].name}...")
        cmd = f"source ~/env.sh && hive -S -f {q['file']}"
        res = subprocess.run(cmd, shell=True, executable="/bin/bash", stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        valid_rows = []
        for line in res.stdout.splitlines():
            line = line.strip()
            if not line or line.startswith("WARN:") or line.startswith("SLF4J:") or line.startswith("Logging initialized") or line.startswith("Hive Session ID"):
                continue
            parts = line.split("\t")
            if len(parts) == len(q["header"]):
                valid_rows.append(parts)
            else:
                # Could be a space-delimited or slightly different line, let's check
                print(f"Warning: line parts mismatch: {parts}")
                
        # Write to CSV with proper quoting
        with open(q["output"], "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
            writer.writerow(q["header"])
            for row in valid_rows:
                writer.writerow(row)
                
        print(f"  [OK] Saved {len(valid_rows)} rows to {q['output']}")

if __name__ == "__main__":
    run_and_format()
