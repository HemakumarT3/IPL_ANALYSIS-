"""
backend/routes/api.py
Flask API Blueprints exposing verified IPL Analytics endpoints.
Adheres to consistent REST JSON schemas, HTTP status codes, error handling,
and explicit data source transparency.
"""

import logging
from flask import Blueprint, jsonify, request
from backend.services.mysql_service import MySQLService
from backend.services.mongo_service import MongoService
from backend.services.analytical_service import AnalyticalService
from backend.services.team_registry import ALL_FRANCHISES

logger = logging.getLogger(__name__)
api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check distinguishing API liveness from data service availability.
    """
    mysql_health = MySQLService.test_connection()
    mongo_health = MongoService.test_connection()
    sources_status = AnalyticalService.get_sources_status()
    
    # Check if underlying match dataset is ready
    dataset_ready = False
    try:
        df = AnalyticalService.get_dataframe()
        dataset_ready = len(df) > 0
    except Exception:
        dataset_ready = False

    return jsonify({
        "status": "healthy",
        "api_alive": True,
        "dataset_ready": dataset_ready,
        "backend": "Flask REST API v2.0 (IPL Analytics)",
        "services": {
            "mysql": mysql_health,
            "mongodb": mongo_health,
            "pig_output": sources_status["sources"]["pig"],
            "hive_output": sources_status["sources"]["hive"]
        }
    }), 200

@api_bp.route("/overview", methods=["GET"])
def get_overview():
    season = request.args.get("season")
    data = MySQLService.get_overview(season=season)
    return jsonify(data), 200

@api_bp.route("/teams", methods=["GET"])
def get_teams():
    data = MySQLService.get_teams()
    return jsonify(data), 200

@api_bp.route("/teams/performance", methods=["GET"])
def get_team_performance():
    season = request.args.get("season")
    team = request.args.get("team")
    data = MySQLService.get_teams_performance(season=season, team=team)
    return jsonify(data), 200

@api_bp.route("/teams/head-to-head", methods=["GET"])
def get_head_to_head():
    team1 = request.args.get("team1")
    team2 = request.args.get("team2")
    if not team1 or not team2:
        return jsonify({"error": "Query parameters 'team1' and 'team2' are required."}), 400
    data = MySQLService.get_head_to_head(team1=team1, team2=team2)
    return jsonify(data), 200

@api_bp.route("/toss", methods=["GET"])
def get_toss_analysis():
    season = request.args.get("season")
    data = MySQLService.get_toss_analysis(season=season)
    return jsonify(data), 200

@api_bp.route("/venues", methods=["GET"])
def get_venues():
    season = request.args.get("season")
    data = MySQLService.get_venues(season=season)
    return jsonify(data), 200

@api_bp.route("/venues/performance", methods=["GET"])
def get_venues_performance():
    venue = request.args.get("venue")
    season = request.args.get("season")
    data = MySQLService.get_venues_performance(venue=venue, season=season)
    return jsonify(data), 200

@api_bp.route("/seasons", methods=["GET"])
def get_seasons():
    season = request.args.get("season")
    team = request.args.get("team")
    data = MySQLService.get_seasons(season=season, team=team)
    return jsonify(data), 200

@api_bp.route("/insights", methods=["GET"])
def get_insights():
    data = MySQLService.get_insights()
    return jsonify(data), 200

@api_bp.route("/data-quality", methods=["GET"])
def get_data_quality():
    data = AnalyticalService.get_data_quality()
    return jsonify(data), 200

@api_bp.route("/sources/status", methods=["GET"])
def get_sources_status():
    status = AnalyticalService.get_sources_status()
    return jsonify(status), 200
