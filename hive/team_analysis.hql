-- hive/team_analysis.hql
-- Team Performance Analysis in Apache Hive

USE ipl_analytics;

-- 1. Team Wins Ranking
SELECT 
    winner AS team, 
    COUNT(*) AS total_wins
FROM matches
WHERE winner IS NOT NULL AND winner <> 'NONE'
GROUP BY winner
ORDER BY total_wins DESC;

-- 2. Matches Played and Win Percentage per Team
SELECT 
    p.team,
    p.matches_played,
    COALESCE(w.total_wins, 0) AS total_wins,
    ROUND(100.0 * COALESCE(w.total_wins, 0) / p.matches_played, 2) AS win_percentage
FROM (
    SELECT team, COUNT(*) AS matches_played
    FROM matches
    LATERAL VIEW explode(array(team1, team2)) t AS team
    WHERE team IS NOT NULL AND team <> ''
    GROUP BY team
) p
LEFT JOIN (
    SELECT winner AS team, COUNT(*) AS total_wins
    FROM matches
    WHERE winner IS NOT NULL AND winner <> 'NONE'
    GROUP BY winner
) w ON p.team = w.team
ORDER BY win_percentage DESC, total_wins DESC;
