# Environment Verification & Dataset Inspection Report

**Project Title:** IPL Team, Toss & Venue Performance Analysis Using Hadoop, HDFS, MySQL, MongoDB, Apache Pig and Apache Hive  
**Environment:** Windows 11 + WSL 2 (Ubuntu Linux 6.18.33.2-microsoft-standard-WSL2)  
**Workspace:** `/home/hemakumar_t3/ipl-bigdata`  
**Inspection Date:** 2026-10-11  

---

## 1. System & Technology Stack Availability

| Technology | Expected Component | Installed Version | Current Status | Verification Command | Notes / Fixes Applied |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Java** | OpenJDK 8 Runtime | `1.8.0_504` | **Operational** | `java -version` | Required for Hive 3.1.3 & Pig 0.18.0; Java 17 also available at `/usr/lib/jvm/java-17-openjdk-amd64` |
| **Apache Hadoop** | Core & Common | `3.4.3` | **Operational** | `hadoop version` | Configured in `/opt/hadoop`, environment linked via `~/env.sh` |
| **HDFS** | Distributed File System | `3.4.3` | **Running** | `hdfs dfs -ls /` | NameNode, DataNode & SecondaryNameNode running on `hdfs://localhost:9000` |
| **YARN** | MapReduce / NodeMgr | `3.4.3` | **Running** | `jps` | ResourceManager & NodeManager active |
| **Apache Pig** | Pig Latin Engine | `0.18.0 (r1926484)` | **Operational** | `pig -x local -e "sh echo PIG_OK;"` | Tested and validated on Java 8 |
| **Apache Hive** | Data Warehouse / HQL | `3.1.3` | **Operational** | `hive -e "show databases;"` | Initialized Derby Metastore, resolved Guava conflict with `guava-32.0.1-jre.jar`, installed `libcommons-collections3-java` |
| **MySQL** | Relational Database | `8.4.11` | **Running** | `mysqladmin ping` | Service active, user `ipl_user` created with full privileges on `ipl_db` |
| **MongoDB** | Document Database | `8.0.32` | **Running** | `mongosh --eval "db.version()"` | Service active on port 27017, `mongosh 2.13.0` verified |
| **Python** | Python Runtime & Pip | `3.14.4` / pip `25.1.1` | **Operational** | `python3 -V` | Virtual environment created at `/home/hemakumar_t3/ipl_venv` with Flask, pandas, PyMongo, mysql-connector-python, pytest |
| **Node.js** | JavaScript Runtime | `v22.22.1` | **Operational** | `node -v` | Installed natively in WSL Ubuntu |
| **npm** | Package Manager | `9.2.0` | **Operational** | `npm -v` | Installed natively in WSL Ubuntu |

---

## 2. Hadoop Daemon Inspection (jps verification)

All core Big Data daemons were started and verified using `jps`:

- **NameNode** (Active)
- **DataNode** (Active)
- **SecondaryNameNode** (Active)
- **ResourceManager** (Active)
- **NodeManager** (Active)

HDFS root verification:
```text
drwxr-xr-x   - hemakumar_t3 supergroup          0 2026-09-18 09:38 /hbase
```

---

## 3. Dataset Inspection & Audit

- **Source File Path:** `D:\SEM 5\Big_data_lab\bdc project\raw data\ipl.csv`
- **WSL Source Path:** `/mnt/d/SEM 5/Big_data_lab/bdc project/raw data/ipl.csv`
- **Project Raw Path:** `/home/hemakumar_t3/ipl-bigdata/data/raw/ipl.csv`
- **File Integrity:** MD5 Checksum = `472584d8a0b3dcec763b13019994cd39` (100% matched)
- **Row Count:** 1,170 lines = 1 header row + **1,169 match records**
- **Column Count:** 19 columns

### Schema Columns
1. `team1` (string): First participating team
2. `team2` (string): Second participating team
3. `match_date` (string): Match date in YYYY-MM-DD format
4. `toss_winner` (string): Team that won the coin toss
5. `toss_decision` (string): 'bat' or 'field'
6. `winner` (string): Match winner (empty in 23 matches due to ties/no-results/abandonment)
7. `player_of_match` (string): Player of the match award recipient
8. `venue` (string): Stadium name where the fixture was played
9. `city` (string): City hosting the fixture
10. `team1_players` (quoted string list): Playing XI of team 1 (comma-delimited inside double quotes)
11. `team2_players` (quoted string list): Playing XI of team 2 (comma-delimited inside double quotes)
12. `season` (integer): Tournament edition (1 to 18, representing 2008 to 2025)
13. `match_number` (integer): Sequential match number within the season
14. `match_type` (string): Match classification ('League', 'Semi Final', 'Final', 'Qualifier 1', 'Qualifier 2', 'Eliminator', 'Elimination Final', '3rd Place Play-Off')
15. `result` (string): Outcome type ('runs', 'wickets', 'tie', 'no result', 'abandoned')
16. `result_margin` (float/numeric): Margin of victory in runs or wickets
17. `target_runs` (float/numeric): Target score set in second innings
18. `target_overs` (float/numeric): Scheduled target overs
19. `super_over` (string): 'Y' if a super over occurred, else 'N'

---

## 4. Data Quality & Distribution Audit

### Missing Values Summary
- **winner:** 23 missing records
  - 13 ties where winner column is unpopulated
  - 2 ties (Super Overs) marked as 'wickets' where winner column is unpopulated in source CSV (Row 329 SRH vs RCB in 2013, Row 706 KKR vs DC in 2019)
  - 7 no-result matches (rain/abandoned during play)
  - 1 abandoned match without ball bowled
- **city:** 51 missing records (fixtures hosted in UAE/Sharjah/Dubai where city column was left blank in the source data)
- **result_margin:** 23 missing records (corresponds to tied, no-result, and abandoned games)
- **target_runs / target_overs:** 6 missing records
- **team1, team2, match_date, toss_winner, toss_decision, venue, season:** 0 missing (100% complete)

### Match Outcomes Breakdown
- **Wins by wickets (chasing):** 615 (52.61%)
- **Wins by runs (defending):** 531 (45.42%)
- **Ties:** 15 (1.28%)
- **No results:** 7 (0.60%)
- **Abandoned:** 1 (0.09%)
- **Total matches:** 1,169

### Toss Decisions Breakdown
- **Field first:** 764 (65.35%)
- **Bat first:** 405 (34.65%)

### Unique Teams & Historical Rebranding
19 distinct team names appear in the dataset:
- Chennai Super Kings
- Deccan Chargers (defunct franchise, transitioned to SRH in 2013)
- Delhi Daredevils (rebranded as Delhi Capitals in 2019)
- Delhi Capitals
- Gujarat Lions (2-year temporary franchise 2016-2017)
- Gujarat Titans (new franchise from 2022)
- Kings XI Punjab (rebranded as Punjab Kings in 2021)
- Punjab Kings
- Kochi Tuskers Kerala (single season 2011)
- Kolkata Knight Riders
- Lucknow Super Giants (new franchise from 2022)
- Mumbai Indians
- Pune Warriors (Pune Warriors India 2011-2013)
- Rajasthan Royals
- Rising Pune Supergiant (2017 name)
- Rising Pune Supergiants (2016 name)
- Royal Challengers Bangalore (original name 2008-2023)
- Royal Challengers Bengaluru (rebranded in 2024)
- Sunrisers Hyderabad

### Venues Breakdown
- Total unique stadium designations: 59
- Top 5 most frequent venues:
  1. Eden Gardens, Kolkata (77)
  2. Wankhede Stadium, Mumbai (73 + 52 with city suffix = 125 total)
  3. M Chinnaswamy Stadium, Bangalore / Bengaluru (65)
  4. Feroz Shah Kotla, Delhi (60)
  5. Rajiv Gandhi International Stadium, Uppal, Hyderabad (49)

---

## 5. Big Data Platform Compatibility Resolutions

1. **Java ClassCastException in Hive:**
   - *Problem:* Hadoop 3.4.3 `hadoop-env.sh` set `JAVA_HOME` to Java 17 by default. Hive 3.1.3 relies on URLClassLoader casting in `SessionState`, causing a fatal crash on Java 17.
   - *Resolution:* Configured `/opt/hadoop/etc/hadoop/hadoop-env.sh` and `~/env.sh` to use OpenJDK 8 (`/usr/lib/jvm/java-8-openjdk-amd64`).
2. **Hive Metastore Guava Conflict:**
   - *Problem:* Hive 3.1.3 ships with `guava-19.0.jar` whereas Hadoop 3.4.3 requires `guava-32.0.1-jre.jar`, causing NoSuchMethodError.
   - *Resolution:* Replaced Hive's `guava-19.0.jar` with `guava-32.0.1-jre.jar`.
3. **Hive Commons-Collections NoClassDefFoundError:**
   - *Problem:* Hadoop 3.4.3 removed old `commons-collections-3.2.2.jar`, but Hive 3.1.3 `ObjectStore` still imports `org.apache.commons.collections.CollectionUtils`.
   - *Resolution:* Installed `libcommons-collections3-java` via apt and deployed `commons-collections3.jar` into `/usr/local/hive/lib/`.
4. **Embedded Derby Metastore Corruption:**
   - *Problem:* Partial earlier initialization left orphaned functions (`NUCLEUS_ASCII`).
   - *Resolution:* Cleaned corrupted derby database and initialized cleanly using `schematool -dbType derby -initSchema`. Verified with `hive -e "show databases;"`.
5. **CSV Delimiter Handling in Pig & Hive:**
   - *Problem:* `team1_players` and `team2_players` contain commas inside quotes. Standard PigStorage or basic Hive text tables split on every comma, destroying the schema.
   - *Resolution:* Created a specialized Python preparation pipeline that outputs a clean, quote-safe analysis CSV without internal delimiter conflicts, while keeping the original raw CSV intact for SerDe validation.
