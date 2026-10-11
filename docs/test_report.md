# IPL Big Data Analytics Engine - Comprehensive Test & Validation Report

**Generated:** 2026-10-11  
**Project:** IPL Team, Toss & Venue Performance Analysis  
**Overall Validation Status:** ✅ ALL TESTS PASSED (100% PARITY)

---

## 1. Executive Summary

This report documents the automated and end-to-end verification of the Big Data analytics pipeline processing 1,169 official Indian Premier League match records from 2008 through 2024. All analytical computations were executed independently across four compute paradigms:
1. **Batch Distributed MapReduce**: Apache Pig 0.18.0
2. **Distributed Data Warehousing**: Apache Hive 3.1.3
3. **Relational Database Engine**: MySQL 8.4 RDBMS
4. **Document NoSQL Engine**: MongoDB 8.0

---

## 2. Infrastructure & Storage Verification

| Component | Target / URI | Expected | Observed | Status |
| :--- | :--- | :--- | :--- | :--- |
| **HDFS NameNode** | `hdfs://localhost:9000` | Online | Active (Port 9000) | ✅ PASS |
| **HDFS Raw Storage** | `/ipl_project/raw/ipl.csv` | 1,169 rows | 1,169 rows (103 KB) | ✅ PASS |
| **HDFS Processed** | `/ipl_project/processed/` | Clean TSV/CSV | Verified | ✅ PASS |
| **MySQL 8.4** | `ipl_db.matches` | 1,169 rows | 1,169 rows | ✅ PASS |
| **MongoDB 8.0** | `ipl_db.matches` | 1,169 docs | 1,169 documents | ✅ PASS |
| **Derby Metastore** | `metastore_db` | Initialized | Verified | ✅ PASS |

---

## 3. Cross-Engine Mathematical Parity Matrix

The following table demonstrates exact mathematical parity across all independent computational engines:

| Franchise Team | Apache Hive (MR) | Apache Pig (MR) | MySQL 8.4 (SQL) | MongoDB 8.0 (NoSQL) | Parity Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mumbai Indians** | 151 | 151 | 151 | 151 | ✅ 100% MATCH |
| **Chennai Super Kings** | 142 | 142 | 142 | 142 | ✅ 100% MATCH |
| **Kolkata Knight Riders** | 135 | 135 | 135 | 135 | ✅ 100% MATCH |
| **Royal Challengers Bengaluru** | 132 | 132 | 132 | 132 | ✅ 100% MATCH |
| **Punjab Kings** | 119 | 119 | 119 | 119 | ✅ 100% MATCH |
| **Delhi Capitals** | 118 | 118 | 118 | 118 | ✅ 100% MATCH |
| **Rajasthan Royals** | 114 | 114 | 114 | 114 | ✅ 100% MATCH |
| **Sunrisers Hyderabad** | 93 | 93 | 93 | 93 | ✅ 100% MATCH |
| **Gujarat Titans** | 37 | 37 | 37 | 37 | ✅ 100% MATCH |
| **Lucknow Super Giants** | 30 | 30 | 30 | 30 | ✅ 100% MATCH |

---

## 4. Analytical Findings Parity

### Toss Advantage Verification
- **Total Matches Analyzed:** 1,169
- **Toss Winner Won Match:** 600 (51.33%)
- **Toss Winner Lost Match:** 569 (48.67%)
- **Toss Edge:** +1.33% (statistically marginal)
- **Consistency:** 100% identical across MySQL, MongoDB, Pig, and Hive.

### Venue Bias Findings
- **Highest Chasing Advantage:** Sharjah Cricket Stadium (75.00% chasing wins)
- **Highest Defending Fortress:** MA Chidambaram Stadium / Chepauk (58.43% defending wins)
- **Most Matches Hosted:** Wankhede Stadium (125 matches, 57.26% chasing wins)

---

## 5. Automated REST API & Integration Test Results

10 automated pytest test cases executed against the Flask backend:
- `test_index_endpoint`: PASSED
- `test_health_endpoint`: PASSED
- `test_overview_endpoint`: PASSED
- `test_teams_endpoint`: PASSED
- `test_teams_performance_endpoint`: PASSED
- `test_toss_endpoint`: PASSED
- `test_venues_performance_endpoint`: PASSED
- `test_seasons_endpoint`: PASSED
- `test_insights_endpoint`: PASSED
- `test_validation_endpoint`: PASSED

**Result:** 10 passed in 1.17s (100% pass rate).
