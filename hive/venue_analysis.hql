-- hive/venue_analysis.hql
-- Venue Match Frequency and Defending vs Chasing Statistics in Apache Hive

USE ipl_analytics;

-- 1. Venue Popularity (Match Counts)
SELECT 
    venue,
    city,
    COUNT(*) AS total_matches
FROM matches
GROUP BY venue, city
ORDER BY total_matches DESC;

-- 2. Defending vs Chasing Outcomes by Venue (Venues with >= 10 matches)
SELECT 
    venue,
    COUNT(*) AS total_matches,
    SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) AS defending_wins,
    SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) AS chasing_wins,
    SUM(CASE WHEN result = 'tie' THEN 1 ELSE 0 END) AS tied_matches,
    ROUND(100.0 * SUM(CASE WHEN result = 'runs' THEN 1 ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS defending_win_pct,
    ROUND(100.0 * SUM(CASE WHEN result = 'wickets' THEN 1 ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN result IN ('runs', 'wickets') THEN 1 ELSE 0 END), 0), 2) AS chasing_win_pct
FROM matches
GROUP BY venue
HAVING total_matches >= 10
ORDER BY total_matches DESC;

-- 3. Team Wins by Venue (Top Fortress Venues)
SELECT 
    venue,
    winner AS team,
    COUNT(*) AS venue_wins
FROM matches
WHERE winner IS NOT NULL AND winner <> 'NONE'
GROUP BY venue, winner
HAVING venue_wins >= 5
ORDER BY venue ASC, venue_wins DESC;
