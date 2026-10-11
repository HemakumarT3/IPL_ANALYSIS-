-- pig/venue_analysis.pig
-- Venue Defending vs Chasing Outcomes in Apache Pig

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

-- Pre-project indicator flags for outcomes
venue_rows = FOREACH clean_records GENERATE
    venue,
    (result == 'runs' ? 1 : 0) AS is_runs:int,
    (result == 'wickets' ? 1 : 0) AS is_wickets:int,
    (result == 'tie' ? 1 : 0) AS is_tie:int;

venue_grp = GROUP venue_rows BY venue;
venue_stats = FOREACH venue_grp GENERATE
    group AS venue:chararray,
    COUNT(venue_rows) AS total_matches:long,
    SUM(venue_rows.is_runs) AS defending_wins:long,
    SUM(venue_rows.is_wickets) AS chasing_wins:long,
    SUM(venue_rows.is_tie) AS tied_matches:long;

venue_defend_chase = FOREACH venue_stats GENERATE
    venue,
    total_matches,
    defending_wins,
    chasing_wins,
    tied_matches,
    (double)ROUND(((double)defending_wins * 10000.0 / (double)(defending_wins + chasing_wins))) / 100.0 AS defending_win_pct:double,
    (double)ROUND(((double)chasing_wins * 10000.0 / (double)(defending_wins + chasing_wins))) / 100.0 AS chasing_win_pct:double;

ordered_venue = ORDER venue_defend_chase BY total_matches DESC;

STORE ordered_venue INTO 'hdfs://localhost:9000/ipl_project/pig/venue_defend_chase' USING PigStorage(',');
