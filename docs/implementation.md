# End-to-End Implementation & Engineering Guide

**Project:** IPL Team, Toss & Venue Performance Analysis Using Big Data Technologies  
**Operating Environment:** WSL 2 Ubuntu Linux on Windows Host  
**Dataset:** 1,169 Official Match Records (Seasons 2008–2024)

---

## 1. Environment Discovery, Compatibility & Stack Fixes

Building a heterogeneous Big Data environment on WSL 2 requires resolving critical binary, runtime, and classpath compatibility issues across Hadoop 3.4.3, Apache Hive 3.1.3, and Apache Pig 0.18.0:

1. **JVM Pinning to Java 8:** Hadoop 3.4.3 defaults to system Java (Java 17 in Ubuntu 24.04). However, Apache Hive 3.1.3 and Apache Pig 0.18.0 depend on internal Java reflection and security managers that fail under Java 17 (`InaccessibleObjectException`). We permanently pinned:
   ```bash
   export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
   ```
   in `/opt/hadoop/etc/hadoop/hadoop-env.sh`, `/usr/local/hive/conf/hive-env.sh`, and `~/env.sh`.

2. **Guava Library Alignment:** Hive 3.1.3 ships with `guava-19.0.jar`, while Hadoop 3.4.3 requires `guava-32.0.1-jre.jar`. Calling Hive CLI produced runtime `NoSuchMethodError` crashes in `Stopwatch`. Resolved by removing Hive's outdated jar and symlinking Hadoop's modern Guava jar:
   ```bash
   rm /usr/local/hive/lib/guava-19.0.jar
   cp /opt/hadoop/share/hadoop/common/lib/guava-32.0.1-jre.jar /usr/local/hive/lib/
   ```

3. **Apache Commons-Collections Restoration:** Hadoop 3.4.3 removed legacy `commons-collections-3.2.2.jar`. However, Hive's Derby metastore `ObjectStore` and Pig's internal circular buffer rely on `org.apache.commons.collections.Buffer`. We deployed `commons-collections-3.2.2.jar` into `/usr/local/hive/lib/`, `/usr/local/pig/lib/`, and `/opt/hadoop/share/hadoop/common/lib/`.

4. **Derby Metastore Schema Initialization:** Initialized the embedded Derby metastore cleanly:
   ```bash
   schematool -dbType derby -initSchema
   ```

5. **MapReduce Memory Tuning in LocalJobRunner:** Set `HADOOP_HEAPSIZE=2048` and configured `SET mapreduce.task.io.sort.mb=20;` to prevent heap exhaustion during in-process map-side sorts.

---

## 2. Data Preparation Pipeline (`scripts/prepare_ipl.py`)

The raw dataset at `data/raw/ipl.csv` (1,170 lines = 1 header + 1,169 match records, MD5 `472584d8a0b3dcec763b13019994cd39`) was preprocessed by `scripts/prepare_ipl.py`:
- Generated surrogate key `match_id` (1 to 1,169) ensuring database primary key performance.
- Harmonized franchise names across rebrands (Delhi Daredevils -> Delhi Capitals, Kings XI Punjab -> Punjab Kings, Royal Challengers Bangalore -> Royal Challengers Bengaluru).
- Imputed missing host cities from venue mappings (e.g. Dubai, Sharjah, Mohali, Bengaluru).
- Handled tie margins by setting `result_margin = 0`.
- Produced:
  - `data/processed/ipl_clean.csv` (standard RFC-4180 CSV)
  - `data/processed/ipl_pig_hive.tsv` (tab-delimited, quote-safe format for Pig and Hive)
  - `data/semi_structured/matches.jsonl` (1,169 JSON Lines)
  - `data/semi_structured/match_summaries.txt` (1,169 lines of structured summaries for Pig wordcount)
  - `data/processed/data_quality_report.json`

---

## 3. Distributed HDFS Storage (`scripts/upload_to_hdfs.sh`)

Distributed directory hierarchy created in HDFS:
```bash
hdfs dfs -mkdir -p /ipl_project/raw
hdfs dfs -mkdir -p /ipl_project/processed
hdfs dfs -mkdir -p /ipl_project/sql
hdfs dfs -mkdir -p /ipl_project/semi_structured
hdfs dfs -mkdir -p /ipl_project/pig
hdfs dfs -mkdir -p /ipl_project/hive/matches
hdfs dfs -mkdir -p /ipl_project/output
```
All raw, processed, and semi-structured files were uploaded using `hdfs dfs -put -f`. Verified via `hdfs dfs -test -e` and `hdfs dfs -du -h /ipl_project`.

---

## 4. MySQL Relational Schema & Export (`sql/schema.sql`, `scripts/load_mysql.py`)

- **Schema:** Created `ipl_db.matches` with explicit data types, primary key `match_id`, and indexes on `season`, `venue`, `winner`, `team1`, `team2`, and `toss_winner`.
- **Loading:** Loaded 1,169 rows using parameterized batch inserts (`executemany`) inside database transactions.
- **Analytical Queries & HDFS Export (`scripts/export_mysql.py`):**
  Executed 9 SQL queries:
  1. `team_wins.csv` (total match victories per franchise)
  2. `matches_played.csv` (matches contested)
  3. `team_win_percentage.csv` (win percentages)
  4. `toss_decisions.csv` (field vs bat frequency)
  5. `toss_advantage.csv` (conversion percentage)
  6. `venue_matches.csv` (matches hosted per stadium)
  7. `venue_defend_chase.csv` (defending vs chasing win %)
  8. `season_performance.csv` (wins per team per season)
  9. `mysql_matches.csv` (full table dump)
  All 9 outputs were written to `output/mysql/*.csv` and uploaded to HDFS `/ipl_project/sql/`.

---

## 5. MongoDB NoSQL Document Storage (`scripts/import_mongodb.py`)

- Loaded 1,169 structured documents with hierarchical sub-documents (`teams`, `toss`, `result`, `venue`) into collection `ipl_db.matches`.
- Built 7 compound B-tree indexes:
  - `season_1_winner_1`
  - `venue.stadium_1_result.winner_1`
  - `toss.toss_win_match_win_1`
  - `teams.team1_1_teams.team2_1`
  - `result.player_of_match_1`
- Executed 6 aggregation pipelines:
  - `wins_by_team.json`
  - `toss_winner_vs_match_winner.json`
  - `toss_decisions.json`
  - `matches_per_venue.json`
  - `team_wins_by_venue.json`
  - `team_performance_by_season.json`
  Persisted to `output/mongodb/*.json` and HDFS `/ipl_project/output/mongodb/`.

---

## 6. Apache Pig Latin MapReduce Execution (`pig/*.pig`, `scripts/run_pig_jobs.sh`)

Implemented 4 Pig Latin scripts:
1. `pig/team_analysis.pig`: Computes total matches, total wins, and win percentage per franchise.
2. `pig/toss_analysis.pig`: Computes toss-win to match-win conversion percentage per franchise.
3. `pig/venue_analysis.pig`: Computes defending vs chasing victory percentages per venue.
4. `pig/text_analysis.pig`: Tokenizes match text summaries and computes player frequency via MapReduce.

All scripts executed in MapReduce mode using `pig -x mapreduce`. Partitions merged into `output/pig/*.csv` and uploaded to HDFS `/ipl_project/pig/`.

---

## 7. Apache Hive Data Warehouse Execution (`hive/*.hql`, `scripts/run_hive_queries.sh`)

- Created external table `ipl_hive_db.matches` over `/ipl_project/hive/matches/` with tab-delimited formatting.
- Executed 3 MapReduce analytical queries:
  1. `hive/team_analysis.hql`: Franchise performance rankings.
  2. `hive/toss_analysis.hql`: Team toss advantage conversion rate.
  3. `hive/venue_analysis.hql`: Stadium defend vs chase bias.
- Parsed and quoted outputs into RFC-4180 CSV files in `output/hive/*.csv` and uploaded to HDFS `/ipl_project/output/hive/`.

---

## 8. Flask REST API Backend (`backend/app.py`)

Built modular Flask backend with CORS enabled for frontend visualization:
- `backend/config.py`: Centralized environment configurations.
- `backend/services/mysql_service.py`: Real-time SQL queries with fallback to precomputed CSVs.
- `backend/services/mongo_service.py`: Real-time NoSQL aggregation pipelines.
- `backend/services/analytical_service.py`: Big Data MapReduce output serving and cross-engine validation engine.
- `backend/routes/api.py`: REST endpoints (`/api/health`, `/api/overview`, `/api/teams`, `/api/toss`, `/api/venues/performance`, `/api/seasons`, `/api/insights`, `/api/validation`, `/api/data-quality`).
- `backend/tests/test_api.py`: 10 pytest unit tests (100% pass rate).

---

## 9. React + Vite Interactive Dashboard (`frontend/`)

Developed high-end responsive analytics web application with Recharts:
- **Overview View:** Executive headline metrics, Big Data architecture pipeline flow, and live cluster health status.
- **Team Analysis View:** Dynamic source toggle (Apache Hive MapReduce / Apache Pig Latin / MySQL RDBMS), podium cards, and interactive bar charts.
- **Toss Analysis View:** Coin-toss outcome pie charts, toss decision trends (bat first vs field first from 2008 to 2024), and team conversion rankings.
- **Venue Analysis View:** Defending vs chasing win percentages across 23 major stadiums.
- **Season & Rivalry View:** Mumbai Indians vs Chennai Super Kings El Clásico head-to-head, top 10 Player of the Match awards, and victory margins.
- **Cross-Engine Validation View:** Dedicated mathematical parity matrix showing green checkmarks across Hive, Pig, MySQL, and MongoDB.
- **Data Quality View:** Ingestion audit, checksum verification, and canonical naming harmonization rules.
- **Source Badges:** Every visual component prominently displays its underlying data engine (`SourceBadge.jsx`).

---

## 10. Automated Validation & Parity Testing (`scripts/validate_results.py`)

Executed automated cross-engine verification checking:
- MySQL row count = 1,169
- MongoDB document count = 1,169
- HDFS accessibility
- Pig output files and record counts
- Hive output files and record counts
- Exact win count match across all 10 major franchises (Mumbai Indians: 151, CSK: 142, KKR: 135, RCB: 132, PBKS: 119, DC: 118, RR: 114, SRH: 93, GT: 37, LSG: 30).
- Toss correlation parity: 600 wins (51.33%) across all 4 platforms.
- Generated `docs/test_report.md`.
