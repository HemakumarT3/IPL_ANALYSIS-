-- hive/toss_analysis.hql
-- Toss Decisions and Match Outcomes Analysis in Apache Hive

USE ipl_analytics;

-- 1. Toss Decision Distribution (Batting vs Fielding)
SELECT 
    toss_decision,
    COUNT(*) AS match_count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM matches), 2) AS percentage
FROM matches
GROUP BY toss_decision
ORDER BY match_count DESC;

-- 2. Toss Winner to Match Winner Conversion per Team
SELECT 
    toss_winner AS team,
    COUNT(*) AS toss_wins,
    SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) AS match_wins_after_toss,
    ROUND(100.0 * SUM(CASE WHEN toss_winner_won = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS toss_to_win_conversion_pct
FROM matches
WHERE toss_winner IS NOT NULL AND toss_winner <> ''
GROUP BY toss_winner
ORDER BY match_wins_after_toss DESC;
