#!/usr/bin/env python3
"""
scripts/import_mongodb.py
Idempotent MongoDB import, index creation, and aggregation pipeline execution for IPL project.
Saves actual aggregation outputs to output/mongodb/.
"""

import json
import os
import sys
from pymongo import MongoClient, UpdateOne, ASCENDING, DESCENDING

def get_mongo_client():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017/")
    return MongoClient(mongo_uri)

def run_aggregations(db, output_dir):
    print("\n--- Running MongoDB Aggregation Pipelines ---")
    os.makedirs(output_dir, exist_ok=True)
    matches = db.matches

    # 1. Matches per venue
    p1 = [
        {"$match": {"venue.name": {"$ne": None, "$ne": ""}}},
        {"$group": {"_id": "$venue.name", "total_matches": {"$sum": 1}}},
        {"$sort": {"total_matches": -1, "_id": 1}}
    ]
    r1 = list(matches.aggregate(p1))
    with open(os.path.join(output_dir, "matches_per_venue.json"), "w", encoding="utf-8") as f:
        json.dump(r1, f, indent=2)
    print(f"  [1/6] matches_per_venue.json: {len(r1)} venues")

    # 2. Wins by team
    p2 = [
        {"$match": {"outcome.winner": {"$ne": None, "$ne": ""}}},
        {"$group": {"_id": "$outcome.winner", "wins": {"$sum": 1}}},
        {"$sort": {"wins": -1, "_id": 1}}
    ]
    r2 = list(matches.aggregate(p2))
    with open(os.path.join(output_dir, "wins_by_team.json"), "w", encoding="utf-8") as f:
        json.dump(r2, f, indent=2)
    print(f"  [2/6] wins_by_team.json: {len(r2)} teams")

    # 3. Toss decision distribution
    p3 = [
        {"$match": {"toss.decision": {"$in": ["bat", "field"]}}},
        {"$group": {"_id": "$toss.decision", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    r3 = list(matches.aggregate(p3))
    with open(os.path.join(output_dir, "toss_decisions.json"), "w", encoding="utf-8") as f:
        json.dump(r3, f, indent=2)
    print(f"  [3/6] toss_decisions.json: {len(r3)} decisions")

    # 4. Toss winner vs match winner comparison
    p4 = [
        {"$match": {"toss.toss_winner": {"$ne": None, "$ne": ""}}},
        {
            "$group": {
                "_id": "$toss.toss_winner",
                "toss_wins": {"$sum": 1},
                "matches_won": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$toss.toss_winner", "$outcome.winner"]},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            "$project": {
                "_id": 1,
                "team": "$_id",
                "toss_wins": 1,
                "matches_won": 1,
                "conversion_rate": {
                    "$round": [
                        {"$multiply": [{"$divide": ["$matches_won", "$toss_wins"]}, 100]},
                        2
                    ]
                }
            }
        },
        {"$sort": {"matches_won": -1, "toss_wins": -1}}
    ]
    r4 = list(matches.aggregate(p4))
    with open(os.path.join(output_dir, "toss_winner_vs_match_winner.json"), "w", encoding="utf-8") as f:
        json.dump(r4, f, indent=2)
    print(f"  [4/6] toss_winner_vs_match_winner.json: {len(r4)} teams")

    # 5. Team performance by season
    p5 = [
        {"$match": {"outcome.winner": {"$ne": None, "$ne": ""}}},
        {
            "$group": {
                "_id": {
                    "season": "$season",
                    "team": "$outcome.winner"
                },
                "wins": {"$sum": 1}
            }
        },
        {"$sort": {"_id.season": 1, "wins": -1}}
    ]
    r5 = list(matches.aggregate(p5))
    with open(os.path.join(output_dir, "team_performance_by_season.json"), "w", encoding="utf-8") as f:
        json.dump(r5, f, indent=2)
    print(f"  [5/6] team_performance_by_season.json: {len(r5)} season-team entries")

    # 6. Team wins by venue
    p6 = [
        {
            "$match": {
                "venue.name": {"$ne": None, "$ne": ""},
                "outcome.winner": {"$ne": None, "$ne": ""}
            }
        },
        {
            "$group": {
                "_id": {
                    "venue": "$venue.name",
                    "team": "$outcome.winner"
                },
                "wins": {"$sum": 1}
            }
        },
        {"$sort": {"_id.venue": 1, "wins": -1}}
    ]
    r6 = list(matches.aggregate(p6))
    with open(os.path.join(output_dir, "team_wins_by_venue.json"), "w", encoding="utf-8") as f:
        json.dump(r6, f, indent=2)
    print(f"  [6/6] team_wins_by_venue.json: {len(r6)} venue-team combinations")

    print(f"All aggregation results successfully persisted to {output_dir}")

def import_mongodb():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    jsonl_path = os.path.join(base_dir, "data", "semi_structured", "matches.jsonl")
    output_mongo_dir = os.path.join(base_dir, "output", "mongodb")

    if not os.path.exists(jsonl_path):
        print(f"Error: {jsonl_path} does not exist. Run prepare_ipl.py first.", file=sys.stderr)
        sys.exit(1)

    client = get_mongo_client()
    db = client.ipl_db
    matches = db.matches

    print("--- MongoDB Initialization & Indexing ---")
    # Create indexes for optimal query and aggregation performance
    matches.create_index([("match_id", ASCENDING)], unique=True)
    matches.create_index([("season", ASCENDING)])
    matches.create_index([("venue.name", ASCENDING)])
    matches.create_index([("outcome.winner", ASCENDING)])
    matches.create_index([("toss.toss_winner", ASCENDING)])
    matches.create_index([("toss.decision", ASCENDING)])
    print("Indexes created: match_id (unique), season, venue.name, outcome.winner, toss.toss_winner, toss.decision")

    print(f"\n--- Loading Documents from {jsonl_path} ---")
    operations = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                doc = json.loads(line)
                operations.append(
                    UpdateOne(
                        {"match_id": doc["match_id"]},
                        {"$set": doc},
                        upsert=True
                    )
                )

    if operations:
        result = matches.bulk_write(operations, ordered=False)
        print(f"Bulk write completed: Upserted={len(result.upserted_ids)}, Modified={result.modified_count}, Matched={result.matched_count}")

    doc_count = matches.count_documents({})
    print(f"\n[VERIFIED] Total documents in ipl_db.matches: {doc_count}")

    if doc_count != len(operations):
        raise ValueError(f"Document count mismatch: expected {len(operations)}, found {doc_count}")

    # Run required aggregations
    run_aggregations(db, output_mongo_dir)

    client.close()
    print("\nMongoDB import and analysis stage completed successfully.")

if __name__ == "__main__":
    import_mongodb()
