-- pig/team_analysis.pig
-- Team Performance Analysis in Apache Pig

raw_records = LOAD 'hdfs://localhost:9000/ipl_project/processed/ipl_pig_hive.tsv' USING PigStorage('\t') AS (
    match_id:chararray,
    team1:chararray,
    team2:chararray,
    match_date:chararray,
    toss_winner:chararray,
    toss_decision:chararray,
    winner:chararray,
    player_of_match:chararray,
    venue:chararray,
    city:chararray,
    season:int,
    match_type:chararray,
    result:chararray,
    result_margin:double,
    target_runs:double,
    target_overs:double,
    super_over:chararray,
    toss_winner_won:int,
    team1_players:chararray,
    team2_players:chararray
);

-- 1. Filter out header row
clean_records = FILTER raw_records BY match_id != 'match_id';

-- 2. Transform into team appearances and win markers
team1_app = FOREACH clean_records GENERATE team1 AS team, (winner == team1 ? 1 : 0) AS won:int;
team2_app = FOREACH clean_records GENERATE team2 AS team, (winner == team2 ? 1 : 0) AS won:int;
all_appearances = UNION team1_app, team2_app;

-- 3. Group by team and calculate aggregate metrics
team_groups = GROUP all_appearances BY team;
team_stats = FOREACH team_groups GENERATE
    group AS team:chararray,
    COUNT(all_appearances) AS matches_played:long,
    SUM(all_appearances.won) AS total_wins:long;

team_performance = FOREACH team_stats GENERATE
    team,
    matches_played,
    total_wins,
    (double)ROUND(((double)total_wins * 10000.0 / (double)matches_played)) / 100.0 AS win_percentage:double;

-- 4. Order by total wins descending
ordered_performance = ORDER team_performance BY total_wins DESC, matches_played DESC;

-- 5. Store output in HDFS
STORE ordered_performance INTO 'hdfs://localhost:9000/ipl_project/pig/team_performance' USING PigStorage(',');
