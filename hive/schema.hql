-- hive/schema.hql
-- Apache Hive Schema Definition for IPL Analytics

CREATE DATABASE IF NOT EXISTS ipl_analytics;
USE ipl_analytics;

-- External table over the tab-delimited processed file in HDFS
DROP TABLE IF EXISTS matches;

CREATE EXTERNAL TABLE IF NOT EXISTS matches (
    match_id INT,
    team1 STRING,
    team2 STRING,
    match_date STRING,
    toss_winner STRING,
    toss_decision STRING,
    winner STRING,
    player_of_match STRING,
    venue STRING,
    city STRING,
    season INT,
    match_type STRING,
    result STRING,
    result_margin DOUBLE,
    target_runs DOUBLE,
    target_overs DOUBLE,
    super_over STRING,
    toss_winner_won INT,
    team1_players STRING,
    team2_players STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
STORED AS TEXTFILE
LOCATION '/ipl_project/hive/matches'
TBLPROPERTIES ("skip.header.line.count" = "1");

-- Table verification
SELECT COUNT(*) AS total_records FROM matches;
SELECT match_id, team1, team2, match_date, winner, venue, season FROM matches LIMIT 5;
