-- pig/toss_analysis.pig
-- Toss Advantage and Decision Analysis in Apache Pig

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

clean_records = FILTER raw_records BY match_id != 'match_id';

-- Group by toss winner team
toss_team_grp = GROUP clean_records BY toss_winner;
toss_team_stats = FOREACH toss_team_grp GENERATE
    group AS team:chararray,
    COUNT(clean_records) AS toss_wins:long,
    SUM(clean_records.toss_winner_won) AS match_wins_after_toss:long;

toss_advantage = FOREACH toss_team_stats GENERATE
    team,
    toss_wins,
    match_wins_after_toss,
    (double)ROUND(((double)match_wins_after_toss * 10000.0 / (double)toss_wins)) / 100.0 AS toss_to_win_pct:double;

ordered_toss = ORDER toss_advantage BY match_wins_after_toss DESC, toss_wins DESC;

STORE ordered_toss INTO 'hdfs://localhost:9000/ipl_project/pig/toss_advantage' USING PigStorage(',');
