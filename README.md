# IPL Team, Toss & Venue Performance Analysis Using Big Data Technologies

An end-to-end, academic Big Data engineering and analytics project built with **Hadoop 3.4.3, HDFS, Apache Pig 0.18.0, Apache Hive 3.1.3, MySQL 8.4 RDBMS, MongoDB 8.0 NoSQL, Python Flask, and React 18**.

Analyzes **1,169 official Indian Premier League matches (2008–2024)** across multiple distributed computing paradigms to investigate franchise dominance, coin-toss advantage, and stadium pitch biases with **100.0% mathematical parity across all engines**.

---

## 🚀 Key Empirical Analytical Findings

1. **The Toss Reality:** Out of 1,169 matches, the team winning the toss won the match in **600 games (51.33%)** and lost in **569 games (48.67%)**. Winning the toss provides only a marginal **+1.33% winning edge**, refuting the common belief that the toss dictates victory.
2. **Evolution of Toss Strategy:** In 2008–2010, captains chose batting first ~50% of the time. By 2024, captains elected to **field first in >70% of matches**, driven by evening dew factors and data-backed chasing advantages.
3. **Franchise Dominance:**
   - **Most Match Wins:** **Mumbai Indians** with **151 wins** in 277 matches (54.51% win rate).
   - **Highest Veteran Win Rate:** **Chennai Super Kings** with **142 wins** in 252 matches (**56.35% win rate**).
4. **Venue Biases (Defend vs Chase):**
   - **Highest Chasing Venue:** **Sharjah Cricket Stadium** (Chasing win rate = **75.00%**, 21 of 28 matches won batting second).
   - **Highest Defending Fortress:** **MA Chidambaram Stadium / Chepauk** (Defending win rate = **58.43%**, 52 of 91 matches won batting first).
   - **Most Frequented Stadium:** **Wankhede Stadium, Mumbai** (125 matches, 57.26% chasing win rate).
5. **El Clásico Rivalry:** Mumbai Indians leads Chennai Super Kings **21 wins to 17 wins** across all head-to-head encounters.
6. **Top Match Winner:** **AB de Villiers** holds the all-time record with **25 Player of the Match awards**, followed by **Chris Gayle (22)** and **Rohit Sharma (19)**.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────┐
                    │   data/raw/ipl.csv     │
                    │   (1,169 Matches)      │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  scripts/prepare_ipl.py│
                    │  (Canonical ETL & TSV) │
                    └─────┬───────┬───────┬──┘
                          │       │       │
       ┌──────────────────┘       │       └──────────────────┐
       ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐           ┌──────────────┐
│  Hadoop HDFS │          │  MySQL 8.4   │           │ MongoDB 8.0  │
│ /ipl_project │          │   matches    │           │   matches    │
└───┬──────┬───┘          └───────┬──────┘           └───────┬──────┘
    │      │                      │                          │
    ▼      ▼                      │                          │
┌───────┐┌───────┐                │                          │
│ Apache││Apache │                │                          │
│  Pig  ││ Hive  │                │                          │
│  (MR) ││ (HQL) │                │                          │
└───┬───┘└───┬───┘                │                          │
    │        │                    │                          │
    └────┬───┘                    │                          │
         ▼                        ▼                          ▼
     ┌──────────────────────────────────────────────────────────┐
     │           Flask REST API Backend (Port 5000)             │
     │      (Dynamic Engine Attribution & Parity Engine)        │
     └────────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
     ┌──────────────────────────────────────────────────────────┐
     │           React 18 + Vite Dashboard (Port 5173)          │
     │   (Interactive Charts, Source Badges, Parity Matrix)     │
     └──────────────────────────────────────────────────────────┘
```

---

## 📊 Cross-Engine Parity Matrix (100% Agreement)

The pipeline was executed independently across batch MapReduce, relational SQL, and NoSQL aggregation pipelines. All four technologies produced **identical numerical results**:

| Franchise Team | Apache Hive (MR) | Apache Pig (MR) | MySQL 8.4 (SQL) | MongoDB 8.0 (NoSQL) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mumbai Indians** | **151** | **151** | **151** | **151** | ✅ MATCH |
| **Chennai Super Kings** | **142** | **142** | **142** | **142** | ✅ MATCH |
| **Kolkata Knight Riders** | **135** | **135** | **135** | **135** | ✅ MATCH |
| **Royal Challengers Bengaluru** | **132** | **132** | **132** | **132** | ✅ MATCH |
| **Punjab Kings** | **119** | **119** | **119** | **119** | ✅ MATCH |
| **Delhi Capitals** | **118** | **118** | **118** | **118** | ✅ MATCH |
| **Rajasthan Royals** | **114** | **114** | **114** | **114** | ✅ MATCH |
| **Sunrisers Hyderabad** | **93** | **93** | **93** | **93** | ✅ MATCH |
| **Gujarat Titans** | **37** | **37** | **37** | **37** | ✅ MATCH |
| **Lucknow Super Giants** | **30** | **30** | **30** | **30** | ✅ MATCH |

---

## 🛠️ Technology Stack & Versions

- **OS Environment:** WSL 2 Ubuntu Linux (`24.04 LTS`)
- **Java Runtime:** OpenJDK 8 (`1.8.0_504`) pinned for Hadoop/Pig/Hive compatibility
- **Distributed Storage:** Apache Hadoop 3.4.3 HDFS (`hdfs://localhost:9000`)
- **Batch Dataflow:** Apache Pig 0.18.0 (Pig Latin on MapReduce)
- **Data Warehousing:** Apache Hive 3.1.3 (HiveQL with Derby Metastore)
- **Relational Storage:** MySQL 8.4 RDBMS (InnoDB Engine)
- **Document NoSQL:** MongoDB 8.0 (WiredTiger Engine)
- **Backend API:** Python 3.14, Flask 3.1.3, Flask-CORS, PyMongo, MySQL Connector
- **Frontend Dashboard:** React 18, Vite 5, Recharts, Lucide React

---

## ⚡ Quickstart & Execution Runbook

### 1. Start Big Data Services & Hadoop Daemons
```bash
# Source environment variables (Java 8, Hadoop, Pig, Hive)
source ~/env.sh

# Start HDFS NameNode, DataNode & SecondaryNameNode
start-dfs.sh

# Verify Hadoop daemons are running
jps
# Expected: NameNode, DataNode, SecondaryNameNode
```

### 2. Start MySQL and MongoDB
```bash
sudo service mysql start
sudo systemctl start mongod
```

### 3. Run End-to-End Pipeline & Batch Compute
```bash
cd /home/hemakumar_t3/ipl-bigdata

# 1. Run Data Preparation & Cleaning ETL
/home/hemakumar_t3/ipl_venv/bin/python scripts/prepare_ipl.py

# 2. Upload Datasets to Distributed HDFS
bash scripts/upload_to_hdfs.sh

# 3. Ingest into MySQL and Run Export Queries
/home/hemakumar_t3/ipl_venv/bin/python scripts/load_mysql.py
/home/hemakumar_t3/ipl_venv/bin/python scripts/export_mysql.py

# 4. Ingest into MongoDB & Run Aggregation Pipelines
/home/hemakumar_t3/ipl_venv/bin/python scripts/import_mongodb.py

# 5. Execute Apache Pig Latin MapReduce Jobs
bash scripts/run_pig_jobs.sh

# 6. Execute Apache Hive Warehouse HQL Queries
bash scripts/run_hive_queries.sh
```

### 4. Run Automated Tests & Cross-Engine Validation
```bash
# Run cross-engine parity validation script
/home/hemakumar_t3/ipl_venv/bin/python scripts/validate_results.py

# Run all 16 automated pytest unit and integration tests
PYTHONPATH=. /home/hemakumar_t3/ipl_venv/bin/pytest backend/tests/test_api.py tests/test_pipeline.py -v
```

### 5. Launch Web Application & Access Dashboard
```bash
# Terminal 1: Launch Flask REST API (Port 5000)
cd /home/hemakumar_t3/ipl-bigdata
PYTHONPATH=. /home/hemakumar_t3/ipl_venv/bin/python backend/app.py

# Terminal 2: Launch React Frontend Dashboard (Port 5173)
cd /home/hemakumar_t3/ipl-bigdata/frontend
npm run dev -- --host
```
Open your browser at:
- **Interactive Dashboard:** `http://localhost:5173`
- **REST API Endpoints:** `http://localhost:5000/api/overview`

---

## 📁 Repository Directory Structure

```
/home/hemakumar_t3/ipl-bigdata/
├── backend/                  # Flask REST API service
│   ├── app.py                # App entrypoint and CORS config
│   ├── config.py             # Database and directory settings
│   ├── routes/               # REST API endpoints (/api/*)
│   ├── services/             # MySQL, MongoDB & Analytical services
│   └── tests/                # 10 automated backend pytest tests
├── data/
│   ├── raw/                  # Original raw CSV (1,169 matches)
│   ├── processed/            # Cleaned CSV & TSV datasets
│   └── semi_structured/      # JSON Lines and match summary texts
├── docs/                     # Academic documentation
│   ├── architecture.md       # Architectural blueprints & Mermaid diagrams
│   ├── data_dictionary.md    # Field specifications and canonical mappings
│   ├── implementation.md     # Step-by-step engineering implementation guide
│   ├── test_report.md        # Automated validation test report
│   ├── viva_questions.md     # 25 in-depth academic viva questions & answers
│   └── environment_report.md # Environment audit and configuration details
├── frontend/                 # React 18 + Vite + Recharts Dashboard
│   ├── src/                  # Components, pages, and services
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite build and proxy configuration
├── hive/                     # Apache Hive schema and analytical HQL scripts
├── output/                   # Reconciled output datasets
│   ├── hive/                 # Hive MapReduce outputs
│   ├── mongodb/              # MongoDB aggregation JSON outputs
│   ├── mysql/                # MySQL exported analytical CSVs
│   └── pig/                  # Apache Pig MapReduce outputs
├── pig/                      # Apache Pig Latin dataflow scripts
├── scripts/                  # Automated pipelines, ETL, and validation scripts
├── sql/                      # Relational schema and queries
└── tests/                    # Pipeline integration tests
```

---

## 🎓 Academic Documentation Reference

For academic defense, evaluation, and project presentation, refer to the dedicated guides in `docs/`:
- **[System Architecture](docs/architecture.md):** Architectural design, flow diagrams, and polyglot persistence models.
- **[Data Dictionary](docs/data_dictionary.md):** Complete attribute specifications and canonical franchise transformations.
- **[Implementation Guide](docs/implementation.md):** Technical challenges, JVM fixes, and execution runbooks.
- **[Test Report](docs/test_report.md):** Empirical proof of 100% parity across all 4 compute engines.
- **[Viva Voce Guide](docs/viva_questions.md):** 25 detailed viva questions covering HDFS, MapReduce, Pig, Hive, MySQL, and MongoDB.
