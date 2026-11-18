import os
import sys
from flask import Blueprint, request, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.classifier import load_risk_classifier, predict_single_observation
from ml.explainer import explain_prediction
from ml.rule_engine import get_conservation_action_plans
from ml.scoring import compute_water_stress_scores

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/current', methods=['GET'])
def get_current_risk():
    df, thresh = compute_water_stress_scores()
    latest = df.iloc[-1].to_dict()

    # Get SHAP explanation
    explanation = explain_prediction(latest)

    # Get tailored action plans
    plans = get_conservation_action_plans(
        explanation['predicted_risk'],
        explanation.get('primary_root_causes', [])
    )

    return jsonify({
        "date": str(latest['datetime'])[:10],
        "water_stress_score": float(latest['water_stress_score']),
        "predicted_risk": explanation['predicted_risk'],
        "thresholds": thresh,
        "primary_root_causes": explanation['primary_root_causes'],
        "shap_contributions": explanation['feature_contributions'],
        "conservation_plans": plans
    }), 200

@risk_bp.route('/simulate', methods=['POST'])
def simulate_risk():
    """
    Interactive 'What-If' Simulation:
    User changes sliders for rainfall, temperature, and groundwater depth to see
    how risk severity and SHAP contributions react in real-time.
    """
    data = request.get_json() or {}
    
    obs = {
        'precip_30d': float(data.get('precip_30d', 10.0)),
        'temp_30d_mean': float(data.get('temp_30d_mean', 31.0)),
        'humidity': float(data.get('humidity', 60.0)),
        'evap_proxy': float(data.get('evap_proxy', 1.2)),
        'gw_level_mbgl': float(data.get('gw_level_mbgl', 11.5)),
        'consecutive_dry_days': int(data.get('consecutive_dry_days', 20)),
        'solarradiation': float(data.get('solarradiation', 220.0))
    }

    pred_class, probs = predict_single_observation(obs)
    explanation = explain_prediction(obs)
    plans = get_conservation_action_plans(pred_class, explanation.get('primary_root_causes', []))

    return jsonify({
        "inputs": obs,
        "predicted_risk": pred_class,
        "class_probabilities": probs,
        "primary_root_causes": explanation['primary_root_causes'],
        "shap_contributions": explanation['feature_contributions'],
        "conservation_plans": plans
    }), 200

@risk_bp.route('/metrics', methods=['GET'])
def get_metrics():
    _, metrics = load_risk_classifier()
    return jsonify(metrics), 200
