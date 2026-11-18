import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from config import DB_PATH

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'planner', 'citizen')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Datasets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        row_count INTEGER,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'VALIDATED',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Forecast Cache Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS forecast_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        forecast_date TEXT NOT NULL,
        temp_pred REAL,
        temp_lower REAL,
        temp_upper REAL,
        precip_pred REAL,
        precip_lower REAL,
        precip_upper REAL,
        stress_score REAL,
        risk_level TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 4. Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        message TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. Recovery Tracker Table (Interventions)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interventions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        start_date TEXT NOT NULL,
        description TEXT,
        target_metric TEXT,
        baseline_stress REAL,
        current_stress REAL,
        status TEXT DEFAULT 'IN_PROGRESS',
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed Default Demo Accounts if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count == 0:
        demo_users = [
            ("Admin User", "admin@aquashield.org", generate_password_hash("admin123"), "admin"),
            ("Water Resource Planner", "planner@mangaluru.gov.in", generate_password_hash("planner123"), "planner"),
            ("Public Citizen", "citizen@gmail.com", generate_password_hash("citizen123"), "citizen")
        ]
        cursor.executemany(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            demo_users
        )
        conn.commit()
        print("✓ Pre-seeded 3 default demo accounts: admin, planner, citizen.")

    # Seed initial alerts if empty
    cursor.execute("SELECT COUNT(*) FROM alerts")
    alert_count = cursor.fetchone()[0]
    if alert_count == 0:
        sample_alerts = [
            ("Summer Drought Precaution", "HIGH", "Netravali Basin recharge below 40%. Mandatory rainwater harvesting advisory active.", "ACTIVE"),
            ("Groundwater Draw Warning", "CRITICAL", "Zone 4 agricultural deep borewell extraction exceeds seasonal replenishment rate.", "ACTIVE"),
            ("Municipal Supply Normalcy", "LOW", "Monsoon reservoir storage restored to 88% capacity. Routine monitoring underway.", "RESOLVED")
        ]
        cursor.executemany(
            "INSERT INTO alerts (title, severity, message, status) VALUES (?, ?, ?, ?)",
            sample_alerts
        )
        conn.commit()

    # Seed sample recovery interventions if empty
    cursor.execute("SELECT COUNT(*) FROM interventions")
    intervention_count = cursor.fetchone()[0]
    if intervention_count == 0:
        sample_interventions = [
            (
                "Artificial Groundwater Recharge Wells (Zone 3)",
                "Groundwater Recharge",
                "Mangaluru Outer Ring",
                "2023-03-15",
                "Constructed 12 percolation recharge pits to capture surface runoff during unseasonal showers.",
                "Water Stress Score Reduction",
                78.5,
                58.2,
                "IMPROVED",
                "planner@mangaluru.gov.in"
            ),
            (
                "Mandatory Municipal Water Rationing",
                "Municipal Rationing",
                "Puttur Industrial Belt",
                "2023-04-01",
                "Restricted high-consumption commercial car-washing and non-essential industrial water draw by 35%.",
                "Peak Demand Reduction",
                82.0,
                64.5,
                "IN_PROGRESS",
                "planner@mangaluru.gov.in"
            )
        ]
        cursor.executemany(
            """INSERT INTO interventions 
               (title, category, location, start_date, description, target_metric, baseline_stress, current_stress, status, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            sample_interventions
        )
        conn.commit()

    conn.close()
    print("✓ SQLite Database initialized successfully.")

if __name__ == "__main__":
    init_db()
