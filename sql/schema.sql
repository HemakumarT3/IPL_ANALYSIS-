-- sql/schema.sql
-- IPL Big Data Project Database Schema

CREATE DATABASE IF NOT EXISTS ipl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ipl_db;

DROP TABLE IF EXISTS matches;

CREATE TABLE matches (
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    team1 VARCHAR(100) NOT NULL,
    team2 VARCHAR(100) NOT NULL,
    team1_clean VARCHAR(100) NOT NULL,
    team2_clean VARCHAR(100) NOT NULL,
    match_date DATE NOT NULL,
    toss_winner VARCHAR(100) NOT NULL,
    toss_winner_clean VARCHAR(100) NOT NULL,
    toss_decision VARCHAR(20) NOT NULL,
    winner VARCHAR(100) DEFAULT NULL,
    winner_clean VARCHAR(100) DEFAULT NULL,
    player_of_match VARCHAR(100) DEFAULT NULL,
    venue VARCHAR(255) NOT NULL,
    venue_clean VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT NULL,
    season INT NOT NULL,
    match_number INT DEFAULT NULL,
    match_type VARCHAR(50) DEFAULT 'League',
    result VARCHAR(50) NOT NULL,
    result_margin DOUBLE DEFAULT NULL,
    target_runs DOUBLE DEFAULT NULL,
    target_overs DOUBLE DEFAULT NULL,
    super_over VARCHAR(5) DEFAULT 'N',
    is_completed TINYINT(1) DEFAULT 1,
    toss_winner_won TINYINT(1) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_season (season),
    INDEX idx_winner (winner_clean),
    INDEX idx_venue (venue_clean),
    INDEX idx_match_date (match_date),
    INDEX idx_toss_decision (toss_decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
