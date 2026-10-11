# Data Dictionary & Schema Specification

**Project:** IPL Team, Toss & Venue Performance Analysis Using Big Data Technologies  
**Dataset:** Official Indian Premier League Match Data (2008–2024)  
**Total Records:** 1,169 Matches  

---

## 1. Raw Dataset Specification (`data/raw/ipl.csv`)

The raw dataset contains 1,169 match records spanning seasons 2008 through 2024.

| Column Name | Data Type | Nullable | Description | Sample Value |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | No | Original identifier from data collection source | `335982` |
| `season` | String / Int | No | Tournament edition or year (e.g. `2008` or `2007/08`) | `2008` |
| `city` | String | Yes | City where the match took place (missing in UAE games) | `Bangalore` |
| `date` | Date (YYYY-MM-DD)| No | Match calendar date | `2008-04-18` |
| `match_type` | String | No | Format/stage (`T20`, `Group`, `Qualifier`, `Final`) | `T20` |
| `player_of_match` | String | Yes | Man of the Match recipient (NULL for abandoned matches) | `BB McCullum` |
| `venue` | String | No | Stadium name (contains legacy and naming variations) | `M Chinnaswamy Stadium` |
| `team1` | String | No | First listed competing team | `Royal Challengers Bangalore` |
| `team2` | String | No | Second listed competing team | `Kolkata Knight Riders` |
| `toss_winner` | String | No | Team winning the pre-match coin toss | `Royal Challengers Bangalore` |
| `toss_decision` | String | No | Choice upon winning toss (`bat` or `field`) | `field` |
| `winner` | String | Yes | Match victor (NULL for no-result matches) | `Kolkata Knight Riders` |
| `result` | String | Yes | Win classification (`runs`, `wickets`, `tie`, `no result`) | `runs` |
| `result_margin` | Float / Int | Yes | Numeric margin of victory | `140` |
| `target_runs` | Float / Int | Yes | First-innings total + 1 to win for chasing side | `223` |
| `target_overs` | Float | Yes | Maximum allotted overs for second innings | `20` |
| `super_over` | String / Int | Yes | Flag indicating whether a Super Over was required (`Y`/`N` or `0`/`1`) | `N` |
| `method` | String | Yes | Method applied (e.g., `D/L` for Duckworth-Lewis rain rule) | `D/L` |
| `umpire1` | String | Yes | On-field primary umpire | `Asad Rauf` |
| `umpire2` | String | Yes | On-field secondary umpire | `RE Koertzen` |

---

## 2. Processed Relational Schema (`data/processed/ipl_clean.csv` & MySQL `ipl_db.matches`)

Cleaned and normalized schema implementing surrogate key indexing and canonical franchise harmonization.

| Field Name | MySQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `match_id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Surrogate numerical identifier (1 to 1,169) |
| `original_id` | `VARCHAR(50)` | `INDEX` | Original raw record identifier |
| `season` | `VARCHAR(20)` | `NOT NULL, INDEX` | Standardized season string (e.g. `2008`) |
| `date` | `DATE` | `NOT NULL, INDEX` | ISO-8601 calendar date |
| `match_type` | `VARCHAR(50)` | `DEFAULT 'T20'` | Match classification stage |
| `team1` | `VARCHAR(100)` | `NOT NULL, INDEX` | Canonical franchise name for Team 1 |
| `team2` | `VARCHAR(100)` | `NOT NULL, INDEX` | Canonical franchise name for Team 2 |
| `toss_winner` | `VARCHAR(100)` | `NOT NULL, INDEX` | Canonical team winning coin toss |
| `toss_decision` | `VARCHAR(20)` | `NOT NULL` | Decision made (`bat` or `field`) |
| `toss_win_match_win` | `TINYINT(1)` | `NOT NULL, INDEX` | Flag: 1 if toss winner won match, else 0 |
| `winner` | `VARCHAR(100)` | `INDEX` | Canonical winning franchise (NULL if no result) |
| `result_margin_type` | `VARCHAR(30)` | `NULL` | Classification of margin (`runs`, `wickets`, `tie`) |
| `result_margin` | `INT` | `DEFAULT 0` | Victory margin amount |
| `target_runs` | `INT` | `DEFAULT 0` | Target runs set |
| `target_overs` | `DECIMAL(4,1)` | `DEFAULT 20.0` | Maximum overs allotted |
| `super_over` | `TINYINT(1)` | `DEFAULT 0` | 1 if decided in Super Over, else 0 |
| `method` | `VARCHAR(30)` | `NULL` | Curtailment rule applied (`D/L` or `NULL`) |
| `player_of_match` | `VARCHAR(100)` | `INDEX` | Man of the Match recipient |
| `venue` | `VARCHAR(150)` | `NOT NULL, INDEX` | Canonical stadium name |
| `city` | `VARCHAR(100)` | `NOT NULL` | Host city (imputed from venue if originally NULL) |
| `umpire1` | `VARCHAR(100)` | `NULL` | Primary field umpire |
| `umpire2` | `VARCHAR(100)` | `NULL` | Secondary field umpire |

---

## 3. Semi-Structured NoSQL Document Schema (MongoDB `ipl_db.matches`)

Hierarchical BSON representation grouping operational attributes into domain sub-documents:

```json
{
  "_id": 1,
  "original_id": "335982",
  "season": "2008",
  "date": "2008-04-18",
  "match_type": "T20",
  "teams": {
    "team1": "Royal Challengers Bengaluru",
    "team2": "Kolkata Knight Riders",
    "competing": ["Royal Challengers Bengaluru", "Kolkata Knight Riders"]
  },
  "toss": {
    "winner": "Royal Challengers Bengaluru",
    "decision": "field",
    "toss_win_match_win": false
  },
  "result": {
    "winner": "Kolkata Knight Riders",
    "margin_type": "runs",
    "margin": 140,
    "super_over": false,
    "method": null,
    "player_of_match": "BB McCullum"
  },
  "target": {
    "runs": 223,
    "overs": 20.0
  },
  "venue": {
    "stadium": "M. Chinnaswamy Stadium",
    "city": "Bengaluru"
  },
  "officials": {
    "umpire1": "Asad Rauf",
    "umpire2": "RE Koertzen"
  }
}
```

---

## 4. Canonical Franchise Name Mapping Matrix

To eliminate historical corporate rebranding fragmentation across 17 seasons, all franchise variants were harmonized to canonical entities:

| Raw Legacy Name | Canonical Harmonized Name | Rationale |
| :--- | :--- | :--- |
| `Delhi Daredevils` | **Delhi Capitals** | Franchise officially rebranded prior to 2019 season. |
| `Kings XI Punjab` | **Punjab Kings** | Franchise officially rebranded prior to 2021 season. |
| `Royal Challengers Bangalore` | **Royal Challengers Bengaluru** | Official franchise name change honoring city naming. |
| `Rising Pune Supergiants` | **Rising Pune Supergiant** | Plural normalization to official BCCI registered name. |
| `Deccan Chargers` | **Deccan Chargers** | Retained as distinct historical franchise (2008–2012). |
| `Sunrisers Hyderabad` | **Sunrisers Hyderabad** | Successor Hyderabad franchise (2013–present). |
| `Gujarat Lions` | **Gujarat Lions** | Temporary two-year franchise (2016–2017). |
| `Gujarat Titans` | **Gujarat Titans** | Expansion franchise (2022–present). |
