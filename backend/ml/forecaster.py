import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import MODELS_DIR
from ml.scoring import compute_water_stress_scores

FORECAST_CACHE_PATH = os.path.join(MODELS_DIR, "forecast_cache.json")
PROPHET_METRICS_PATH = os.path.join(MODELS_DIR, "prophet_metrics.json")

def train_and_cache_forecast(df=None, horizon_days=90):
    """
    Trains Prophet on daily water stress scores, forecasts future horizon with
    uncertainty bounds, evaluates MAE/RMSE/MAPE on the final 90 days, and caches results.
    """
    if df is None:
        df, _ = compute_water_stress_scores()

    prophet_df = pd.DataFrame({
        'ds': pd.to_datetime(df['datetime']),
        'y': df['water_stress_score']
    }).sort_values('ds').reset_index(drop=True)

    # Train / Test split: last 90 days for holdout evaluation
    train_df = prophet_df.iloc[:-90]
    test_df = prophet_df.iloc[-90:]

    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.80
    )
    m.fit(train_df)

    # Evaluate on test set
    future_test = m.make_future_dataframe(periods=len(test_df), freq='D')
    forecast_test = m.predict(future_test).iloc[-len(test_df):]

    y_true = test_df['y'].values
    y_pred = forecast_test['yhat'].values

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mape = float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-5))) * 100.0)

    # Now fit on full dataset for future projection
    m_full = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.80
    )
    m_full.fit(prophet_df)

    future_full = m_full.make_future_dataframe(periods=horizon_days, freq='D')
    forecast_full = m_full.predict(future_full)

    # Format historical points (last 120 days) + future points (90 days)
    combined = []
    # Historical
    hist_slice = df.tail(120)
    for _, r in hist_slice.iterrows():
        combined.append({
            "date": pd.to_datetime(r['datetime']).strftime('%Y-%m-%d'),
            "historical_score": round(float(r['water_stress_score']), 1),
            "temp": round(float(r['temp']), 1),
            "precip": round(float(r['precip']), 1),
            "gw_level": round(float(r['gw_level_mbgl']), 1),
            "is_forecast": False
        })

    # Future projection
    future_slice = forecast_full.tail(horizon_days)
    for _, r in future_slice.iterrows():
        pred_val = round(float(r['yhat']), 1)
        # Assign risk tag
        if pred_val < 45:
            risk = "Low"
        elif pred_val < 65:
            risk = "Medium"
        elif pred_val < 75:
            risk = "High"
        else:
            risk = "Critical"

        combined.append({
            "date": r['ds'].strftime('%Y-%m-%d'),
            "forecast_score": pred_val,
            "forecast_lower": round(float(r['yhat_lower']), 1),
            "forecast_upper": round(float(r['yhat_upper']), 1),
            "risk_level": risk,
            "is_forecast": True
        })

    metrics = {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "horizon_days": horizon_days,
        "evaluation_period_days": 90,
        "model_type": "Additive Time-Series with Seasonal Decomposition (Prophet)"
    }

    with open(PROPHET_METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    with open(FORECAST_CACHE_PATH, "w") as f:
        json.dump({
            "metrics": metrics,
            "timeline": combined
        }, f, indent=2)

    print(f"✓ Prophet Forecaster trained and cached successfully.")
    print(f"  Holdout Evaluation: MAE={mae:.2f} | RMSE={rmse:.2f} | MAPE={mape:.1f}%")
    return metrics, combined

def get_cached_forecast():
    if os.path.exists(FORECAST_CACHE_PATH):
        with open(FORECAST_CACHE_PATH, "r") as f:
            return json.load(f)
    metrics, timeline = train_and_cache_forecast()
    return {"metrics": metrics, "timeline": timeline}

if __name__ == "__main__":
    train_and_cache_forecast(horizon_days=90)
