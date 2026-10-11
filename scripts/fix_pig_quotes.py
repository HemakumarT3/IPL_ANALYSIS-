import csv
from pathlib import Path

fpath = Path("/home/hemakumar_t3/ipl-bigdata/output/pig/venue_defend_chase.csv")
if fpath.exists():
    with open(fpath, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]

    rows = []
    header = lines[0].split(",")
    rows.append(header)

    for line in lines[1:]:
        parts = line.split(",")
        if len(parts) > 7:
            venue = ",".join(parts[:-6])
            rest = parts[-6:]
            rows.append([venue] + rest)
        else:
            rows.append(parts)

    with open(fpath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        for r in rows:
            writer.writerow(r)
    print("Fixed Pig venue_defend_chase.csv quoting successfully!")
