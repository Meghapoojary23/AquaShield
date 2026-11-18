import os
import sys

# Ensure backend root is in Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
from config import RAW_DATA_1, RAW_DATA_2, PROCESSED_DATA_PATH

def load_and_preprocess_data():
    """
    Ingests, cleans, merges the two climate CSVs, and engineers
    hydrological proxy indicators (30d/90d rainfall, aridity, groundwater recharge).
    """
    if os.path.exists(PROCESSED_DATA_PATH):
        df = pd.read_csv(PROCESSED_DATA_PATH)
        df['datetime'] = pd.to_datetime(df['datetime'])
        return df

    print("Loading raw CSV files...")
    df1 = pd.read_csv(RAW_DATA_1)
    df2 = pd.read_csv(RAW_DATA_2)

    # Standardize column sets
    common_cols = [
        'datetime', 'tempmax', 'tempmin', 'temp', 'feelslikemax', 'feelslikemin', 'feelslike',
        'dew', 'humidity', 'precip', 'precipprob', 'precipcover', 'solarradiation',
        'solarenergy', 'uvindex', 'sealevelpressure', 'cloudcover', 'windspeed', 'conditions'
    ]

    # Filter available common columns
    cols_to_use = [c for c in common_cols if c in df1.columns and c in df2.columns]
    
    df1_sub = df1[cols_to_use].copy()
    df2_sub = df2[cols_to_use].copy()

    # Combine datasets
    df = pd.concat([df1_sub, df2_sub], ignore_index=True)

    # Parse dates (format is DD-MM-YYYY)
    df['datetime'] = pd.to_datetime(df['datetime'], format='%d-%m-%Y', errors='coerce')
    df = df.dropna(subset=['datetime']).sort_values('datetime').drop_duplicates(subset=['datetime']).reset_index(drop=True)

    # Clean numeric columns with forward fill & backward fill
    numeric_cols = [c for c in cols_to_use if c != 'datetime' and c != 'conditions']
    for c in numeric_cols:
        df[c] = pd.to_numeric(df[c], errors='coerce')
        df[c] = df[c].ffill().bfill()

    # --- FEATURE ENGINEERING ---
    # 1. Rolling rainfall metrics (in mm)
    df['precip_30d'] = df['precip'].rolling(window=30, min_periods=1).sum()
    df['precip_90d'] = df['precip'].rolling(window=90, min_periods=1).sum()

    # 2. Rolling temperature
    df['temp_7d_mean'] = df['temp'].rolling(window=7, min_periods=1).mean()
    df['temp_30d_mean'] = df['temp'].rolling(window=30, min_periods=1).mean()

    # 3. Aridity & Evaporative Demand Proxy (Hargreaves-based proxy)
    # Heat and dry air drive high evaporation
    df['evap_proxy'] = np.maximum(0, (df['temp'] * (100 - df['humidity']) / 100.0) * 0.1)

    # 4. Proxy Groundwater Level (in meters below ground level - mbgl)
    # In Dakshina Kannada: typical depth varies between 4m (post-monsoon) and 14m (summer peak).
    # Rainfall recharges the water table, whereas high temperatures and dry spells cause decline.
    base_depth = 8.5
    net_inflow = df['precip'].rolling(window=45, min_periods=1).mean() - df['evap_proxy'].rolling(window=45, min_periods=1).mean()
    gw_fluctuation = -(net_inflow - net_inflow.mean()) / (net_inflow.std() + 1e-5) * 2.8
    df['gw_level_mbgl'] = np.clip(base_depth + gw_fluctuation, 3.2, 14.8).round(2)

    # 5. Consecutive Dry Days
    dry_day = (df['precip'] < 1.0).astype(int)
    dry_blocks = (dry_day != dry_day.shift()).cumsum()
    df['consecutive_dry_days'] = dry_day.groupby(dry_blocks).cumsum()

    # Save processed dataset
    df.to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"✓ Processed {len(df)} daily climate records saved to {PROCESSED_DATA_PATH}.")
    return df

if __name__ == "__main__":
    df = load_and_preprocess_data()
    print("Columns:", list(df.columns))
    print("Head:\n", df[['datetime', 'temp', 'precip', 'precip_30d', 'gw_level_mbgl', 'consecutive_dry_days']].head(3))
    print("Tail:\n", df[['datetime', 'temp', 'precip', 'precip_30d', 'gw_level_mbgl', 'consecutive_dry_days']].tail(3))
