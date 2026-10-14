# IPL Team, Toss & Venue Performance Analysis Using Big Data Technologies

An end-to-end Big Data engineering and sports analytics platform built with **Apache Hadoop 3.4.3, HDFS, Apache Pig 0.18.0, Apache Hive 3.1.3, MySQL 8.4 RDBMS, MongoDB 8.0 NoSQL, Python Flask REST API, and React 18 + Vite**.

Analyzes **1,169 official Indian Premier League matches across 18 seasons (2008–2025)** across multiple distributed computing paradigms to investigate franchise dominance, coin-toss advantage, and stadium pitch biases with **100% mathematical parity across all compute engines**.

---

## 🚀 Key Empirical Analytical Findings

1. **The Toss Reality:** Out of 1,169 total matches, exactly **1,146 matches have a decided win/loss outcome** (23 matches were abandoned or ties without a recorded match winner).
   - **Toss Winner Won:** **591 matches (51.57% / 51.6%)**
   - **Toss Winner Lost:** **555 matches (48.43% / 48.4%)**
   - **Empirical Edge:** Winning the toss provides only a marginal **+1.57% winning edge** above random chance, debunking the myth that the coin toss determines T20 match outcomes.
2. **Toss Decision Win Rates:**
   - **Field First (Chasing):** Chosen in 750 decided matches → **408 wins (54.40% / 54.4% win rate)**.
   - **Bat First (Defending):** Chosen in 396 decided matches → **183 wins (46.21% / 46.2% win rate)**.
   - Captains choosing to field first win **8.2% more often** than captains choosing to bat first.
3. **Defending vs Chasing Match Outcomes (All Matches):**
   - **Chasing (Batting Second):** **621 wins (54.19%)**
   - **Defending (Batting First):** **525 wins (45.81%)**
4. **Franchise Dominance (Verified Denominators: Wins / (Wins + Losses) × 100):**
   - **Chennai Super Kings:** 142 wins in 250 decided matches (**56.80% win rate**; 252 matches played, 2 no-results).
   - **Mumbai Indians:** 151 wins in 273 decided matches (**55.31% win rate**; 277 matches played, 4 no-results).
   - **Gujarat Titans:** 37 wins in 60 decided matches (**61.67% win rate**; 60 matches played, 0 no-results).
   - **Kolkata Knight Riders:** 135 wins in 259 decided matches (**52.12% win rate**; 264 matches played, 5 no-results).
   - **Lucknow Super Giants:** 30 wins in 57 decided matches (**52.63% win rate**; 58 matches played, 1 no-result).
   - **Royal Challengers Bengaluru:** 132 wins in 264 decided matches (**50.00% win rate**; 270 matches played, 6 no-results).
   - **Rajasthan Royals:** 114 wins in 229 decided matches (**49.78% win rate**; 235 matches played, 6 no-results).
   - **Sunrisers Hyderabad:** 93 wins in 191 decided matches (**48.69% win rate**; 196 matches played, 5 no-results).
   - **Punjab Kings:** 119 wins in 258 decided matches (**46.12% win rate**; 264 matches played, 6 no-results).
   - **Delhi Capitals:** 118 wins in 258 decided matches (**45.74% win rate**; 267 matches played, 9 no-results).
5. **Venue Pitch Biases:**
   - **Premier Defending Fortress:** **MA Chidambaram Stadium (Chepauk, Chennai)** (58.4% defending win rate).
   - **Premier Chasing Ground:** **Sharjah Cricket Stadium** (75.0% chasing win rate).
   - **Most Frequented Stadium:** **Wankhede Stadium, Mumbai** (125 matches, 57.3% chasing win rate).
6. **El Clásico Rivalry:** Mumbai Indians leads Chennai Super Kings **21 wins to 18 wins** across 39 direct encounters.

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
     │   (Centralized Analytical Layer + Parity Verification)   │
     └────────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
     ┌──────────────────────────────────────────────────────────┐
     │           React 18 + Vite Dashboard (Port 5173)          │
     │      (iplt20.com Styling, Head-to-Head, Parity Audit)    │
     └──────────────────────────────────────────────────────────┘
```

---

## 📊 Cross-Engine Parity Matrix (100% Agreement)

All 4 compute engines execute independently and agree on verified team win totals:

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

## 🏷️ Canonical Franchise Registry & Aliasing

The canonical team registry resolves historical rebrands while strictly preserving historical franchise boundaries:

| Canonical Identity | Status | Recognized Raw Aliases | Rationale |
| :--- | :---: | :--- | :--- |
| **Chennai Super Kings** | Active | CSK | Continuous franchise identity |
| **Delhi Capitals** | Active | Delhi Daredevils, DD, DC | Official December 2018 franchise rebrand |
| **Gujarat Titans** | Active | GT | Founded 2022 |
| **Kolkata Knight Riders** | Active | KKR | Continuous franchise identity |
| **Lucknow Super Giants** | Active | LSG | Founded 2022 |
| **Mumbai Indians** | Active | MI | Continuous franchise identity |
| **Punjab Kings** | Active | Kings XI Punjab, KXIP, PBKS | Official February 2021 franchise rebrand |
| **Rajasthan Royals** | Active | RR | Continuous franchise identity |
| **Royal Challengers Bengaluru** | Active | Royal Challengers Bangalore, RCB | Official March 2024 franchise rebrand |
| **Sunrisers Hyderabad** | Active | SRH | Replaced Deccan Chargers in 2013 |
| **Deccan Chargers** | Historical | DCG | Defunct (2008–2012) — distinct from SRH |
| **Kochi Tuskers Kerala** | Historical | KTK | Defunct (2011) |
| **Pune Warriors** | Historical | Pune Warriors India, PWI | Defunct (2011–2013) |
| **Gujarat Lions** | Historical | GL | Defunct (2016–2017) — distinct from GT |
| **Rising Pune Supergiant** | Historical | Rising Pune Supergiants, RPS | Defunct (2016–2017) |

---

## 🌐 Flask REST API Endpoints

All endpoints return JSON responses with standardized schemas:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Distinguishes API liveness from MySQL/MongoDB/Pig/Hive availability |
| `GET` | `/api/overview` | Overall tournament KPIs, top teams, top venues, season fixture trends |
| `GET` | `/api/teams` | Canonical list of all active and historical franchises |
| `GET` | `/api/teams/performance` | Detailed standings: matches played, wins, losses, NR, win %, toss wins |
| `GET` | `/api/teams/head-to-head` | Direct rivalry records: `?team1=Mumbai Indians&team2=Chennai Super Kings` |
| `GET` | `/api/toss` | Toss advantage, bat vs field win %, defending vs chasing, season trends |
| `GET` | `/api/venues` | List of all 39 documented venues and fixture frequencies |
| `GET` | `/api/venues/performance` | Pitch defend vs chase win rates, sample validity flags (≥10 matches) |
| `GET` | `/api/seasons` | Match counts, date ranges, and team wins across Seasons 1 to 18 |
| `GET` | `/api/insights` | Empirically verified strategic conclusions and award leaders |
| `GET` | `/api/data-quality` | Audit report: 1,169 matches, 0 duplicates, missing values treatment |
| `GET` | `/api/sources/status` | Live connection status and cross-engine multi-technology parity |

---

## ⚡ Local Runbook & Execution

### 1. Start Database Services (in WSL / Linux)
```bash
sudo service mysql start
sudo systemctl start mongod
```

### 2. Run All Automated Tests
```bash
cd /home/hemakumar_t3/ipl-bigdata
PYTHONPATH=. /home/hemakumar_t3/ipl_venv/bin/pytest backend/tests/test_api.py tests/test_calculations.py tests/test_pipeline.py -v
```
*(Runs 21 automated tests covering calculation rules, API responses, and big data pipeline integrity).*

### 3. Launch Flask Backend (Port 5000)
```bash
cd /home/hemakumar_t3/ipl-bigdata
PYTHONPATH=. /home/hemakumar_t3/ipl_venv/bin/python backend/app.py
```

### 4. Launch React Frontend (Port 5173)
```bash
cd /home/hemakumar_t3/ipl-bigdata/frontend
npm run dev -- --host
```

Open browser at:
- **Interactive UI:** `http://localhost:5173`
- **REST API:** `http://localhost:5000/api/overview`

---

## ☁️ Production & Vercel Deployment

- **Frontend Deployment:** Deploy the React app on Vercel. Set the environment variable `VITE_API_BASE_URL` to point to the deployed backend URL (or leave empty if deployed with serverless entrypoint).
- **Vercel Serverless Integration:** `api/index.py` and `vercel.json` allow full-stack serverless execution directly on Vercel with zero external hosting needed.
- **Data Availability:** The backend includes a Centralized Analytics Layer that loads the verified dataset (`data/processed/ipl_clean.csv`) seamlessly when local WSL MySQL/MongoDB are unreachable in cloud environments.
