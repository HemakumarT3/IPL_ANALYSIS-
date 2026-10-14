import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert "mysql" in data["services"]
    assert "mongodb" in data["services"]

def test_overview_endpoint(client):
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.get_json()
    assert "kpis" in data
    assert data["kpis"]["total_matches"] == 1169
    assert len(data["top_teams"]) > 0
    assert "toss_decisions" in data
    assert len(data["toss_decisions"]) == 2

    # Test with season query param
    res_filtered = client.get("/api/overview?season=1")
    assert res_filtered.status_code == 200
    data_filtered = res_filtered.get_json()
    assert data_filtered["kpis"]["total_matches"] == 58

def test_teams_endpoint(client):
    res = client.get("/api/teams")
    assert res.status_code == 200
    data = res.get_json()
    assert "teams" in data
    assert len(data["teams"]) >= 10
    assert "Mumbai Indians" in data["teams"]

def test_teams_performance_endpoint(client):
    res = client.get("/api/teams/performance")
    assert res.status_code == 200
    data = res.get_json()
    assert "data" in data
    assert len(data["data"]) > 0

    # Test with team query param
    res_team = client.get("/api/teams/performance?team=Mumbai Indians")
    assert res_team.status_code == 200
    data_team = res_team.get_json()
    assert len(data_team["data"]) == 1
    assert data_team["data"][0]["team"] == "Mumbai Indians"

def test_head_to_head_endpoint(client):
    res = client.get("/api/teams/head-to-head?team1=Mumbai Indians&team2=Chennai Super Kings")
    assert res.status_code == 200
    data = res.get_json()
    assert "team1" in data and "team2" in data
    assert data["team1"]["name"] == "Mumbai Indians"
    assert data["team2"]["name"] == "Chennai Super Kings"
    assert data["total_matches"] >= 35

def test_toss_endpoint(client):
    res = client.get("/api/toss")
    assert res.status_code == 200
    data = res.get_json()
    assert "decisions" in data
    assert "outcomes" in data
    assert "advantage" in data
    assert "bat_first_vs_field_first" in data
    assert "team_conversion" in data
    assert "season_trends" in data
    assert data["advantage"]["total_matches"] == 1169
    assert data["advantage"]["valid_matches"] == 1146
    assert data["advantage"]["toss_winner_won"] == 591
    # Check that toss win pct uses valid matches denominator
    assert round(data["advantage"]["toss_advantage_pct"], 1) == 51.6

    # Test with season param
    res_season = client.get("/api/toss?season=2008")
    assert res_season.status_code == 200

def test_venues_endpoint(client):
    res = client.get("/api/venues")
    assert res.status_code == 200
    data = res.get_json()
    assert "venues" in data
    assert len(data["venues"]) > 0

def test_venues_performance_endpoint(client):
    res = client.get("/api/venues/performance")
    assert res.status_code == 200
    data = res.get_json()
    assert "venue_performance" in data
    assert len(data["venue_performance"]) > 0

    # Test with venue filter
    res_venue = client.get("/api/venues/performance?venue=Wankhede Stadium")
    assert res_venue.status_code == 200
    data_venue = res_venue.get_json()
    assert data_venue["selected_venue"] == "Wankhede Stadium"

def test_seasons_endpoint(client):
    res = client.get("/api/seasons")
    assert res.status_code == 200
    data = res.get_json()
    assert "seasons" in data
    assert len(data["seasons"]) >= 17

def test_insights_endpoint(client):
    res = client.get("/api/insights")
    assert res.status_code == 200
    data = res.get_json()
    assert "findings" in data
    assert "el_clasico" in data
    assert "margin_types" in data
    assert "top_players_of_match" in data
    assert len(data["top_players_of_match"]) >= 5
    assert data["el_clasico"][0]["wins"] >= 20

def test_data_quality_endpoint(client):
    res = client.get("/api/data-quality")
    assert res.status_code == 200
    data = res.get_json()
    assert "data" in data

def test_sources_status_endpoint(client):
    res = client.get("/api/sources/status")
    assert res.status_code == 200
    data = res.get_json()
    assert "sources" in data
    assert "cross_validation" in data
    assert "mysql" in data["sources"]
    assert "mongodb" in data["sources"]
    assert "pig" in data["sources"]
    assert "hive" in data["sources"]
    # Check that teams matched
    for row in data["cross_validation"]:
        assert row["status"] in ["Matched", "Not available"]
