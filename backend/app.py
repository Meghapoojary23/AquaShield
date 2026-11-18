import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from config import SECRET_KEY
from database import init_db
from routes.auth_routes import auth_bp
from routes.data_routes import data_bp
from routes.forecast_routes import forecast_bp
from routes.risk_routes import risk_bp
from routes.recovery_routes import recovery_bp
from routes.alert_routes import alert_bp
from routes.report_routes import report_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register REST Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(data_bp, url_prefix='/api/data')
app.register_blueprint(forecast_bp, url_prefix='/api/forecast')
app.register_blueprint(risk_bp, url_prefix='/api/risk')
app.register_blueprint(recovery_bp, url_prefix='/api/recovery')
app.register_blueprint(alert_bp, url_prefix='/api/alerts')
app.register_blueprint(report_bp, url_prefix='/api/report')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "service": "AquaShield AI Decision-Support API",
        "version": "1.0.0",
        "database": "SQLite",
        "models": {
            "forecaster": "Prophet",
            "classifier": "Random Forest",
            "explainability": "SHAP",
            "clustering": "K-Means (k=4)"
        }
    }), 200

# Initialize DB when module loaded
with app.app_context():
    init_db()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"\n🌊 AquaShield Backend API running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
