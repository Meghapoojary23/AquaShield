import os
import sys
from flask import Blueprint, request, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.forecaster import get_cached_forecast, train_and_cache_forecast

forecast_bp = Blueprint('forecast', __name__)

@forecast_bp.route('', methods=['GET'], strict_slashes=False)
@forecast_bp.route('/', methods=['GET'], strict_slashes=False)
def get_forecast():
    horizon = request.args.get('horizon', default=90, type=int)
    cached = get_cached_forecast()
    
    # Filter horizon if requested differs
    return jsonify(cached), 200

@forecast_bp.route('/recalculate', methods=['POST'])
def recalculate():
    data = request.get_json() or {}
    horizon = data.get('horizon', 90)
    metrics, timeline = train_and_cache_forecast(horizon_days=horizon)
    return jsonify({
        "message": "Forecast recalculated successfully",
        "metrics": metrics,
        "timeline": timeline
    }), 200
