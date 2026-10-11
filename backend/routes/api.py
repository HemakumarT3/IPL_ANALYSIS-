import logging
from flask import Blueprint, jsonify, request
from backend.services.mysql_service import MySQLService
from backend.services.mongo_service import MongoService
from backend.services.analytical_service import AnalyticalService

logger = logging.getLogger(__name__)
api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/health", methods=["GET"])
def health_check():
    mysql_health = MySQLService.test_connection()
    mongo_health = MongoService.test_connection()
    sources_status = AnalyticalService.get_sources_status()
    
    return jsonify({
        "status": "healthy",
        "backend": "Flask REST API v2.0",
        "services": {
            "mysql": mysql_health,
            "mongodb": mongo_health,
            "pig_output": sources_status["sources"]["pig"],
            "hive_output": sources_status["sources"]["hive"]
        }
    })

@api_bp.route("/overview", methods=["GET"])
def get_overview():
    season = request.args.get("season")
    data = MySQLService.get_overview(season=season)
    return jsonify(data)

@api_bp.route("/teams", methods=["GET"])
def get_teams():
    data = MySQLService.get_teams()
    return jsonify(data)

@api_bp.route("/teams/performance", methods=["GET"])
def get_team_performance():
    season = request.args.get("season")
    team = request.args.get("team")
    data = MySQLService.get_teams_performance(season=season, team=team)
    return jsonify(data)

@api_bp.route("/toss", methods=["GET"])
def get_toss_analysis():
    season = request.args.get("season")
    data = MySQLService.get_toss_analysis(season=season)
    return jsonify(data)

@api_bp.route("/venues", methods=["GET"])
def get_venues():
    season = request.args.get("season")
    data = MySQLService.get_venues(season=season)
    return jsonify(data)

@api_bp.route("/venues/performance", methods=["GET"])
def get_venues_performance():
    venue = request.args.get("venue")
    season = request.args.get("season")
    data = MySQLService.get_venues_performance(venue=venue, season=season)
    return jsonify(data)

@api_bp.route("/seasons", methods=["GET"])
def get_seasons():
    season = request.args.get("season")
    team = request.args.get("team")
    data = MySQLService.get_seasons(season=season, team=team)
    return jsonify(data)

@api_bp.route("/insights", methods=["GET"])
def get_insights():
    data = MySQLService.get_insights()
    return jsonify(data)

@api_bp.route("/data-quality", methods=["GET"])
def get_data_quality():
    data = AnalyticalService.get_data_quality()
    return jsonify(data)

@api_bp.route("/sources/status", methods=["GET"])
def get_sources_status():
    status = AnalyticalService.get_sources_status()
    return jsonify(status)
