import os
import sys
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.scoring import compute_water_stress_scores

data_bp = Blueprint('data', __name__)

# Cached processed dataframe with scores
_CACHED_DF = None

def get_df():
    global _CACHED_DF
    if _CACHED_DF is None:
        _CACHED_DF, _ = compute_water_stress_scores()
    return _CACHED_DF

@data_bp.route('/summary', methods=['GET'])
def get_summary():
    df = get_df()
    latest = df.iloc[-1]

    # Calculate 30-day stats
    last_30d = df.tail(30)
    
    summary = {
        "latest_observation": {
            "date": pd.to_datetime(latest['datetime']).strftime('%Y-%m-%d'),
            "temp": round(float(latest['temp']), 1),
            "tempmax": round(float(latest['tempmax']), 1),
            "tempmin": round(float(latest['tempmin']), 1),
            "humidity": round(float(latest['humidity']), 1),
            "precip": round(float(latest['precip']), 1),
            "precip_30d": round(float(latest['precip_30d']), 1),
            "gw_level_mbgl": round(float(latest['gw_level_mbgl']), 1),
            "consecutive_dry_days": int(latest['consecutive_dry_days']),
            "water_stress_score": round(float(latest['water_stress_score']), 1),
            "risk_level": str(latest['risk_level']),
            "conditions": str(latest.get('conditions', 'Partially cloudy'))
        },
        "averages_30d": {
            "mean_temp": round(float(last_30d['temp'].mean()), 1),
            "mean_humidity": round(float(last_30d['humidity'].mean()), 1),
            "total_rainfall": round(float(last_30d['precip'].sum()), 1),
            "mean_stress_score": round(float(last_30d['water_stress_score'].mean()), 1)
        },
        "dataset_meta": {
            "total_records": len(df),
            "start_date": pd.to_datetime(df['datetime'].iloc[0]).strftime('%Y-%m-%d'),
            "end_date": pd.to_datetime(df['datetime'].iloc[-1]).strftime('%Y-%m-%d'),
            "location": "Dakshina Kannada / Mangaluru (12.66° N, 75.40° E)",
            "years_covered": 14
        }
    }
    return jsonify(summary), 200

@data_bp.route('/history', methods=['GET'])
def get_history():
    days = request.args.get('days', default=180, type=int)
    df = get_df()
    slice_df = df.tail(min(days, len(df)))

    timeline = []
    for _, r in slice_df.iterrows():
        timeline.append({
            "date": pd.to_datetime(r['datetime']).strftime('%Y-%m-%d'),
            "temp": round(float(r['temp']), 1),
            "precip": round(float(r['precip']), 1),
            "precip_30d": round(float(r['precip_30d']), 1),
            "humidity": round(float(r['humidity']), 1),
            "gw_level": round(float(r['gw_level_mbgl']), 1),
            "water_stress_score": round(float(r['water_stress_score']), 1),
            "risk_level": str(r['risk_level'])
        })

    return jsonify({"history": timeline, "count": len(timeline)}), 200

@data_bp.route('/eda', methods=['GET'])
def get_eda():
    df = get_df()
    df_eda = df.copy()
    df_eda['month'] = pd.to_datetime(df_eda['datetime']).dt.month
    df_eda['year'] = pd.to_datetime(df_eda['datetime']).dt.year

    # Monthly rainfall and temperature averages (seasonal breakdown)
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_stats = []
    for m in range(1, 13):
        m_data = df_eda[df_eda['month'] == m]
        monthly_stats.append({
            "month": months[m - 1],
            "avg_monthly_rain": round(float(m_data['precip'].sum() / len(df_eda['year'].unique())), 1),
            "avg_temp": round(float(m_data['temp'].mean()), 1),
            "avg_humidity": round(float(m_data['humidity'].mean()), 1),
            "avg_stress_score": round(float(m_data['water_stress_score'].mean()), 1)
        })

    # Correlation Matrix
    corr_cols = ['temp', 'humidity', 'precip_30d', 'gw_level_mbgl', 'evap_proxy', 'water_stress_score']
    corr = df[corr_cols].corr().round(2).to_dict()

    return jsonify({
        "monthly_patterns": monthly_stats,
        "correlation_matrix": corr,
        "yearly_records_count": int(len(df_eda['year'].unique()))
    }), 200
