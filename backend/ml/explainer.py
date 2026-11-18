import os
import sys
import json
import shap
import pandas as pd
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import MODELS_DIR
from ml.classifier import load_risk_classifier, FEATURE_COLS
from ml.preprocessor import load_and_preprocess_data

SHAP_SUMMARY_PATH = os.path.join(MODELS_DIR, "shap_summary.json")

# Module-level cached explainer
_EXPLAINER = None

def get_tree_explainer():
    global _EXPLAINER
    if _EXPLAINER is None:
        clf, _ = load_risk_classifier()
        _EXPLAINER = shap.TreeExplainer(clf)
    return _EXPLAINER

def explain_prediction(observation_dict):
    """
    Computes exact SHAP values for a single observation and formats them
    for the frontend waterfall chart and root-cause breakdown.
    """
    explainer = get_tree_explainer()
    clf, _ = load_risk_classifier()

    row = [observation_dict.get(c, 0.0) for c in FEATURE_COLS]
    df_single = pd.DataFrame([row], columns=FEATURE_COLS)

    shap_values = explainer.shap_values(df_single)
    pred_class = clf.predict(df_single)[0]

    # Index of predicted class
    class_idx = list(clf.classes_).index(pred_class)

    # For scikit-learn tree models, shap_values can be a list of arrays (one per class) or 3D array
    if isinstance(shap_values, list):
        class_shap = shap_values[class_idx][0]
    elif len(shap_values.shape) == 3:
        class_shap = shap_values[0, :, class_idx]
    else:
        class_shap = shap_values[0]

    contributions = []
    for feat_name, feat_val, s_val in zip(FEATURE_COLS, row, class_shap):
        contributions.append({
            "feature": feat_name,
            "value": round(float(feat_val), 2),
            "shap_value": round(float(s_val), 4),
            "impact": "INCREASES_RISK" if s_val > 0 else "DECREASES_RISK",
            "abs_impact": round(abs(float(s_val)), 4)
        })

    # Sort by absolute impact
    contributions = sorted(contributions, key=lambda x: x['abs_impact'], reverse=True)

    # Human-friendly root cause explanations
    key_drivers = []
    for c in contributions[:3]:
        feat = c['feature']
        val = c['value']
        if feat == 'precip_30d':
            msg = f"30-day rainfall is {val:.1f} mm ({'severe deficit' if val < 20 else 'sufficient accumulation'})."
        elif feat == 'temp_30d_mean':
            msg = f"Mean monthly temperature is {val:.1f} °C ({'elevated thermal stress' if val > 28 else 'normal range'})."
        elif feat == 'gw_level_mbgl':
            msg = f"Estimated water table depth is {val:.1f} meters below ground ({'deep drawdown' if val > 10 else 'healthy storage'})."
        elif feat == 'consecutive_dry_days':
            msg = f"Prolonged dry spell of {int(val)} consecutive days without precipitation."
        elif feat == 'humidity':
            msg = f"Relative humidity at {val:.1f}% ({'dry atmospheric conditions' if val < 60 else 'humid air'})."
        elif feat == 'evap_proxy':
            msg = f"Atmospheric evaporative demand index is {val:.2f}."
        else:
            msg = f"{feat} measured at {val:.2f}."
        key_drivers.append({"driver": msg, "direction": c['impact'], "feature": feat})

    return {
        "predicted_risk": pred_class,
        "feature_contributions": contributions,
        "primary_root_causes": key_drivers
    }

if __name__ == "__main__":
    test_obs = {
        'precip_30d': 5.2,
        'temp_30d_mean': 32.4,
        'humidity': 52.0,
        'evap_proxy': 1.55,
        'gw_level_mbgl': 12.8,
        'consecutive_dry_days': 28,
        'solarradiation': 240.0
    }
    explanation = explain_prediction(test_obs)
    print("Predicted:", explanation['predicted_risk'])
    print("Primary Causes:")
    for d in explanation['primary_root_causes']:
        print(" -", d['driver'])
