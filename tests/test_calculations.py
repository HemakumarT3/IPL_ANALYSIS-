"""
tests/test_calculations.py
Unit tests using a small hand-verifiable dataset for toss analysis,
team performance, alias normalization, and denominator integrity.
"""

import pytest
import pandas as pd
from backend.services.team_registry import normalize_team_name, is_active_franchise
from backend.services.analytical_service import AnalyticalService

@pytest.fixture
def sample_match_data():
    """
    Hand-verifiable dataset with 7 distinct scenarios:
    1. Match 1: Toss winner (CSK) chooses bat and wins.
    2. Match 2: Toss winner (MI) chooses field and wins.
    3. Match 3: Toss winner (RCB alias) chooses bat and loses (KKR wins).
    4. Match 4: Toss winner (Delhi Daredevils alias) chooses field and loses (PBKS alias wins).
    5. Match 5: Missing toss winner (abandoned/rain, no toss).
    6. Match 6: Unknown match winner / No result (Toss won by RR, rain stop).
    7. Match 7: Tie with no winner (Toss won by SRH, chose bat).
    """
    records = [
        # Match 1: Toss won by CSK, chose bat, CSK won
        {
            "match_id": 1, "team1": "Chennai Super Kings", "team2": "Mumbai Indians",
            "toss_winner": "Chennai Super Kings", "toss_decision": "bat",
            "winner": "Chennai Super Kings", "result": "runs", "season": 1
        },
        # Match 2: Toss won by MI, chose field, MI won
        {
            "match_id": 2, "team1": "Kolkata Knight Riders", "team2": "Mumbai Indians",
            "toss_winner": "Mumbai Indians", "toss_decision": "field",
            "winner": "Mumbai Indians", "result": "wickets", "season": 1
        },
        # Match 3: Toss won by RCB (legacy alias), chose bat, KKR won (Toss winner lost)
        {
            "match_id": 3, "team1": "Royal Challengers Bangalore", "team2": "Kolkata Knight Riders",
            "toss_winner": "Royal Challengers Bangalore", "toss_decision": "bat",
            "winner": "Kolkata Knight Riders", "result": "wickets", "season": 1
        },
        # Match 4: Toss won by Delhi Daredevils (legacy alias), chose field, Kings XI Punjab (legacy alias) won
        {
            "match_id": 4, "team1": "Delhi Daredevils", "team2": "Kings XI Punjab",
            "toss_winner": "Delhi Daredevils", "toss_decision": "field",
            "winner": "Kings XI Punjab", "result": "runs", "season": 2
        },
        # Match 5: Missing toss information (None / NaN)
        {
            "match_id": 5, "team1": "Rajasthan Royals", "team2": "Sunrisers Hyderabad",
            "toss_winner": None, "toss_decision": "",
            "winner": "Rajasthan Royals", "result": "wickets", "season": 2
        },
        # Match 6: Match has no valid winner (no result)
        {
            "match_id": 6, "team1": "Rajasthan Royals", "team2": "Chennai Super Kings",
            "toss_winner": "Rajasthan Royals", "toss_decision": "field",
            "winner": None, "result": "no result", "season": 2
        },
        # Match 7: Tie with missing winner
        {
            "match_id": 7, "team1": "Sunrisers Hyderabad", "team2": "Mumbai Indians",
            "toss_winner": "Sunrisers Hyderabad", "toss_decision": "bat",
            "winner": None, "result": "tie", "season": 2
        }
    ]
    df = pd.DataFrame(records)
    df["team1_norm"] = df["team1"].apply(normalize_team_name)
    df["team2_norm"] = df["team2"].apply(normalize_team_name)
    df["toss_norm"] = df["toss_winner"].apply(normalize_team_name)
    df["winner_norm"] = df["winner"].apply(normalize_team_name)
    df["season_num"] = df["season"]
    df["venue_clean"] = "Test Stadium"
    return df

def test_alias_normalization():
    assert normalize_team_name("Delhi Daredevils") == "Delhi Capitals"
    assert normalize_team_name("Kings XI Punjab") == "Punjab Kings"
    assert normalize_team_name("Royal Challengers Bangalore") == "Royal Challengers Bengaluru"
    assert normalize_team_name("Rising Pune Supergiants") == "Rising Pune Supergiant"
    assert normalize_team_name(None) is None
    assert normalize_team_name("") is None

def test_toss_calculations_hand_verified(sample_match_data):
    df = sample_match_data
    # Total matches = 7
    assert len(df) == 7

    # Valid toss records: Match 1, 2, 3, 4, 6, 7 (Match 5 has None toss) = 6 matches
    valid_toss = df[df["toss_norm"].notna()]
    assert len(valid_toss) == 6

    # Valid matches with BOTH toss winner and match winner known:
    # Match 1 (CSK/CSK), Match 2 (MI/MI), Match 3 (RCB/KKR), Match 4 (DC/PBKS) = 4 matches!
    # Matches 5, 6, 7 excluded from toss-to-win denominator.
    valid_outcome = df[df["toss_norm"].notna() & df["winner_norm"].notna()]
    assert len(valid_outcome) == 4

    # Matches won by toss winner: Match 1, Match 2 = 2 matches
    toss_wins = (valid_outcome["toss_norm"] == valid_outcome["winner_norm"]).sum()
    assert toss_wins == 2

    # Matches lost by toss winner: Match 3, Match 4 = 2 matches
    toss_losses = len(valid_outcome) - toss_wins
    assert toss_losses == 2

    # Overall toss-to-match win percentage: 2 / 4 * 100 = 50.0%
    win_pct = (toss_wins / len(valid_outcome)) * 100
    assert win_pct == 50.0

    # Toss decision bat:
    # Valid outcome matches with decision bat: Match 1 (CSK won), Match 3 (RCB lost) = 2 matches
    bat_df = valid_outcome[valid_outcome["toss_decision"] == "bat"]
    assert len(bat_df) == 2
    bat_won = (bat_df["toss_norm"] == bat_df["winner_norm"]).sum()
    assert bat_won == 1
    bat_win_pct = (bat_won / len(bat_df)) * 100
    assert bat_win_pct == 50.0

    # Toss decision field:
    # Valid outcome matches with decision field: Match 2 (MI won), Match 4 (DC lost) = 2 matches
    field_df = valid_outcome[valid_outcome["toss_decision"] == "field"]
    assert len(field_df) == 2
    field_won = (field_df["toss_norm"] == field_df["winner_norm"]).sum()
    assert field_won == 1
    field_win_pct = (field_won / len(field_df)) * 100
    assert field_win_pct == 50.0

def test_team_win_percentage_denominator_rule(sample_match_data):
    df = sample_match_data
    # Test for Rajasthan Royals (RR):
    # Played: Match 5 (won), Match 6 (no result) -> Played = 2
    # Wins: Match 5 (1 win)
    # No results: Match 6 (1 NR)
    # Valid outcomes: 2 - 1 = 1 valid outcome (wins + losses = 1 + 0 = 1)
    # Win % (valid outcomes): 1 / 1 * 100 = 100.0%
    # Win % (all matches): 1 / 2 * 100 = 50.0%
    rr_matches = df[(df["team1_norm"] == "Rajasthan Royals") | (df["team2_norm"] == "Rajasthan Royals")]
    played = len(rr_matches)
    wins = (df["winner_norm"] == "Rajasthan Royals").sum()
    nr = (rr_matches["winner_norm"].isna()).sum()
    valid = played - nr
    losses = valid - wins

    assert played == 2
    assert wins == 1
    assert nr == 1
    assert valid == 1
    assert losses == 0
    win_pct_valid = (wins / valid) * 100
    win_pct_all = (wins / played) * 100
    assert win_pct_valid == 100.0
    assert win_pct_all == 50.0
