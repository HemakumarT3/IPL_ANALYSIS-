-- sql/analysis.sql
-- Comprehensive Analytical SQL Queries for IPL Big Data Analysis

USE ipl_db;

-- ====================================================================
-- 1. TEAM WINS (Canonical Standardized Team Names)
-- ====================================================================
SELECT 
    winner_clean AS team,
    COUNT(*) AS total_wins
FROM matches
WHERE winner_clean IS NOT NULL AND winner_clean <> ''
GROUP BY winner_clean
ORDER BY total_wins DESC;

-- ====================================================================
-- 2. MATCHES PLAYED BY EACH TEAM
-- ====================================================================
SELECT 
    team,
    COUNT(*) AS matches_played
FROM (
    SELECT team1_clean AS team FROM matches
    UNION ALL
    SELECT team2_clean AS team FROM matches
) AS appearances
GROUP BY team
ORDER BY matches_played DESC;

-- ====================================================================
-- 3. TOSS DECISIONS DISTRIBUTION (Batting vs Fielding)
-- ====================================================================
SELECT 
    toss_decision,
    COUNT(*) AS match_count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM matches), 2) AS percentage
FROM matches
GROUP BY toss_decision
ORDER BY match_count DESC;

-- ====================================================================
-- 4. TOSS WINNER VERSUS MATCH WINNER (Toss Conversion Advantage)
-- ====================================================================
SELECT 
    toss_winner_clean AS team,
    COUNT(*) AS toss_wins,
    SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) AS match_wins_after_toss,
    ROUND(100.0 * SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS toss_to_win_conversion_pct
FROM matches
WHERE toss_winner_clean IS NOT NULL
GROUP BY toss_winner_clean
ORDER BY match_wins_after_toss DESC;

-- Overall Toss Advantage across all completed matches
SELECT 
    SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) AS toss_winner_won_match,
    SUM(CASE WHEN toss_winner_won = 0 THEN 1 ELSE 0 END) AS toss_winner_lost_match,
    ROUND(100.0 * SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) / 
          SUM(CASE WHEN toss_winner_won IN (0, 1) THEN 1 ELSE 0 END), 2) AS overall_toss_win_pct
FROM matches
WHERE is_completed = 1;

-- ====================================================================
-- 5. WIN PERCENTAGE BY TEAM (Wins / Total Matches Played)
-- ====================================================================
SELECT 
    p.team,
    p.matches_played,
    COALESCE(w.total_wins, 0) AS total_wins,
    ROUND(100.0 * COALESCE(w.total_wins, 0) / p.matches_played, 2) AS win_percentage
FROM (
    SELECT team, COUNT(*) AS matches_played
    FROM (
        SELECT team1_clean AS team FROM matches
        UNION ALL
        SELECT team2_clean AS team FROM matches
    ) AS all_apps
    GROUP BY team
) p
LEFT JOIN (
    SELECT winner_clean AS team, COUNT(*) AS total_wins
    FROM matches
    WHERE winner_clean IS NOT NULL AND winner_clean <> ''
    GROUP BY winner_clean
) w ON p.team = w.team
ORDER BY win_percentage DESC, total_wins DESC;

-- ====================================================================
-- 6. VENUE POPULARITY & MATCH COUNTS
-- ====================================================================
SELECT 
    venue_clean AS venue,
    city,
    COUNT(*) AS total_matches
FROM matches
GROUP BY venue_clean, city
ORDER BY total_matches DESC;

-- ====================================================================
-- 7. DEFENDING VS CHASING OUTCOMES BY VENUE
-- ====================================================================
SELECT 
    venue_clean AS venue,
    COUNT(*) AS total_matches,
    SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) AS defending_wins,
    SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) AS chasing_wins,
    SUM(CASE WHEN result = 'tie' THEN 1 ELSE 0 END) AS tied_matches,
    ROUND(100.0 * SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS defending_win_pct,
    ROUND(100.0 * SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS chasing_win_pct
FROM matches
GROUP BY venue_clean
HAVING total_matches >= 10
ORDER BY total_matches DESC;

-- ====================================================================
-- 8. TEAM PERFORMANCE BY VENUE (Top venues per team)
-- ====================================================================
SELECT 
    venue_clean AS venue,
    winner_clean AS team,
    COUNT(*) AS venue_wins
FROM matches
WHERE winner_clean IS NOT NULL AND winner_clean <> ''
GROUP BY venue_clean, winner_clean
HAVING venue_wins >= 5
ORDER BY venue_clean ASC, venue_wins DESC;

-- ====================================================================
-- 9. SEASON-WISE PERFORMANCE
-- ====================================================================
SELECT 
    season,
    winner_clean AS team,
    COUNT(*) AS season_wins
FROM matches
WHERE winner_clean IS NOT NULL AND winner_clean <> ''
GROUP BY season, winner_clean
ORDER BY season ASC, season_wins DESC;

-- ====================================================================
-- 10. DATA QUALITY & EDGE CASE AUDIT
-- ====================================================================
SELECT 
    result,
    COUNT(*) AS count_records,
    SUM(CASE WHEN winner IS NULL OR winner = '' THEN 1 ELSE 0 END) AS missing_winner,
    SUM(CASE WHEN super_over = 'Y' THEN 1 ELSE 0 END) AS super_overs
FROM matches
GROUP BY result
ORDER BY count_records DESC;
