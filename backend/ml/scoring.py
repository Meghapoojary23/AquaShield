import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import MODELS_DIR
from ml.preprocessor import load_and_preprocess_data

THRESHOLDS_PATH = os.path.join(MODELS_DIR, "thresholds.json")

def compute_water_stress_scores(df=None):
    """
    Computes composite Water Stress Score (0-100), derives percentile thresholds,
    and cross-validates with K-Means (k=4).
    """
    if df is None:
        df = load_and_preprocess_data()

    df = df.copy()

    scaler = MinMaxScaler()

    # Features for stress calculation
    # Invert rainfall: low rainfall = higher stress (1.0 - norm)
    p_norm = scaler.fit_transform(df[['precip_30d']]).flatten()
    precip_deficit = 1.0 - p_norm

    # Higher temperature = higher stress
    temp_norm = scaler.fit_transform(df[['temp_30d_mean']]).flatten()

    # Lower humidity = higher stress (dry air)
    h_norm = scaler.fit_transform(df[['humidity']]).flatten()
    humidity_deficit = 1.0 - h_norm

    # Deeper groundwater = higher stress
    gw_norm = scaler.fit_transform(df[['gw_level_mbgl']]).flatten()

    # Longer dry spell = higher stress
    dry_norm = scaler.fit_transform(df[['consecutive_dry_days']]).flatten()

    # Weighted composite score (0 to 100)
    # Weights sum to 1.0
    w_precip = 0.35
    w_temp = 0.20
    w_gw = 0.20
    w_hum = 0.15
    w_dry = 0.10

    raw_score = (
        w_precip * precip_deficit +
        w_temp * temp_norm +
        w_gw * gw_norm +
        w_hum * humidity_deficit +
        w_dry * dry_norm
    ) * 100.0

    df['water_stress_score'] = np.clip(raw_score, 0.0, 100.0).round(2)

    # 1. Percentile-based thresholds
    p25 = float(np.percentile(df['water_stress_score'], 25))
    p50 = float(np.percentile(df['water_stress_score'], 50))
    p75 = float(np.percentile(df['water_stress_score'], 75))

    # Assign risk levels
    def assign_risk(score):
        if score < p25:
            return 'Low'
        elif score < p50:
            return 'Medium'
        elif score < p75:
            return 'High'
        else:
            return 'Critical'

    df['risk_level'] = df['water_stress_score'].apply(assign_risk)

    # 2. K-Means (k=4) Cross-Validation
    features_for_clustering = ['precip_30d', 'temp_30d_mean', 'evap_proxy', 'gw_level_mbgl', 'consecutive_dry_days']
    X_cluster = scaler.fit_transform(df[features_for_clustering])
    
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['kmeans_cluster'] = kmeans.fit_predict(X_cluster)

    # Rank clusters by mean water stress score
    cluster_means = df.groupby('kmeans_cluster')['water_stress_score'].mean().sort_values()
    cluster_mapping = {old_id: new_rank for new_rank, old_id in enumerate(cluster_means.index)}
    df['kmeans_ranked'] = df['kmeans_cluster'].map(cluster_mapping)

    # Calculate agreement between Percentile bands (0,1,2,3) and K-Means ranked clusters
    risk_num_map = {'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3}
    percentile_ranks = df['risk_level'].map(risk_num_map)
    agreement = float((percentile_ranks == df['kmeans_ranked']).mean() * 100.0)

    thresholds_data = {
        "p25": round(p25, 2),
        "p50": round(p50, 2),
        "p75": round(p75, 2),
        "min_score": round(float(df['water_stress_score'].min()), 2),
        "max_score": round(float(df['water_stress_score'].max()), 2),
        "mean_score": round(float(df['water_stress_score'].mean()), 2),
        "kmeans_agreement_pct": round(agreement, 2),
        "distribution": {
            "Low": int((df['risk_level'] == 'Low').sum()),
            "Medium": int((df['risk_level'] == 'Medium').sum()),
            "High": int((df['risk_level'] == 'High').sum()),
            "Critical": int((df['risk_level'] == 'Critical').sum())
        }
    }

    with open(THRESHOLDS_PATH, "w") as f:
        json.dump(thresholds_data, f, indent=2)

    print(f"✓ Water Stress Scores calculated. Thresholds: P25={p25:.1f}, P50={p50:.1f}, P75={p75:.1f}")
    print(f"✓ K-Means (k=4) Validation Agreement: {agreement:.1f}%")
    return df, thresholds_data

if __name__ == "__main__":
    df, thresh = compute_water_stress_scores()
    print("Thresholds:", thresh)
    print("Sample:\n", df[['datetime', 'water_stress_score', 'risk_level', 'kmeans_ranked']].tail(5))
