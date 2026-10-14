"""
api/index.py
Vercel Serverless Entrypoint for IPL Analytics Engine.
Allows the full-stack repository to deploy natively on Vercel with zero external hosting needed.
"""

import sys
from pathlib import Path

# Add project root to sys.path so backend imports work seamlessly in serverless environment
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.app import app

# Vercel serverless handler
handler = app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
