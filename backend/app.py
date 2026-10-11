import logging
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.routes.api import api_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes (allows React frontend on port 5173 or any port)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    @app.route("/")
    def index():
        return jsonify({
            "project": Config.PROJECT_NAME,
            "version": Config.VERSION,
            "status": "online",
            "endpoints": [
                "/api/health",
                "/api/overview",
                "/api/teams",
                "/api/teams/performance",
                "/api/toss",
                "/api/venues",
                "/api/venues/performance",
                "/api/seasons",
                "/api/insights",
                "/api/data-quality",
                "/api/validation"
            ]
        })
        
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
