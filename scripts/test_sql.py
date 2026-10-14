from backend.services.mysql_service import MySQLService
conn = MySQLService.get_connection()
c = conn.cursor(dictionary=True)
c.execute('''
    SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END) as completed_matches,
        SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' AND toss_winner_clean = winner_clean THEN 1 ELSE 0 END) as toss_wins,
        SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END) as valid_toss_matches,
        ROUND(SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' AND toss_winner_clean = winner_clean THEN 1 ELSE 0 END) * 100.0 / 
              NULLIF(SUM(CASE WHEN toss_winner_clean IS NOT NULL AND toss_winner_clean != '' AND winner_clean IS NOT NULL AND winner_clean != '' THEN 1 ELSE 0 END), 0), 2) as toss_win_pct
    FROM matches
''')
print('SQL Toss result:', c.fetchone())
