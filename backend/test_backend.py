import os
import sys
import json

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from app import app

def run_tests():
    print("=" * 60)
    print("🧪 Running AquaShield Backend & ML Test Suite")
    print("=" * 60)

    client = app.test_client()

    # 1. Health check
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("✓ [GET /api/health] Status 200 OK - System Online")

    # 2. Login test with pre-seeded demo accounts
    roles = [
        ("admin@aquashield.org", "admin123", "admin"),
        ("planner@mangaluru.gov.in", "planner123", "planner"),
        ("citizen@gmail.com", "citizen123", "citizen")
    ]
    for email, pw, expected_role in roles:
        res = client.post('/api/auth/login', json={"email": email, "password": pw})
        assert res.status_code == 200, f"Login failed for {email}: {res.status_code}"
        data = res.get_json()
        assert data['user']['role'] == expected_role
        print(f"✓ [POST /api/auth/login] Successfully authenticated as '{expected_role}' ({email})")

    # 3. Data summary
    res = client.get('/api/data/summary')
    assert res.status_code == 200
    d = res.get_json()
    print(f"✓ [GET /api/data/summary] Latest Stress: {d['latest_observation']['water_stress_score']} | Risk: {d['latest_observation']['risk_level']} | Total: {d['dataset_meta']['total_records']} rows")

    # 4. Forecast endpoint
    res = client.get('/api/forecast?horizon=90')
    assert res.status_code == 200
    f = res.get_json()
    print(f"✓ [GET /api/forecast] Prophet Model Accuracy: MAE={f['metrics']['mae']} | RMSE={f['metrics']['rmse']} | Points: {len(f['timeline'])}")

    # 5. Risk & SHAP endpoint
    res = client.get('/api/risk/current')
    assert res.status_code == 200
    r = res.get_json()
    print(f"✓ [GET /api/risk/current] Predicted: {r['predicted_risk']} | SHAP Drivers: {len(r['primary_root_causes'])} | Action Plans: {len(r['conservation_plans'])}")

    # 6. What-if Simulation
    sim_payload = {
        "precip_30d": 2.0,
        "temp_30d_mean": 33.5,
        "humidity": 45.0,
        "gw_level_mbgl": 13.5,
        "consecutive_dry_days": 35
    }
    res = client.post('/api/risk/simulate', json=sim_payload)
    assert res.status_code == 200
    sim_data = res.get_json()
    print(f"✓ [POST /api/risk/simulate] Simulated Severe Drought -> Predicted: {sim_data['predicted_risk']}")

    # 7. Recovery Tracker
    res = client.get('/api/recovery/interventions')
    assert res.status_code == 200
    rec = res.get_json()
    print(f"✓ [GET /api/recovery/interventions] Loaded {len(rec['interventions'])} logged interventions")

    # Add new intervention test
    new_int = {
        "title": "Check Dam Desiltation Project",
        "category": "Groundwater Recharge",
        "location": "Netravathi Riverbank Basin",
        "start_date": "2026-05-10",
        "description": "Constructing percolation bunds to prepare for pre-monsoon showers.",
        "baseline_stress": 74.0,
        "created_by": "planner@mangaluru.gov.in"
    }
    res = client.post('/api/recovery/interventions', json=new_int)
    assert res.status_code == 201
    print("✓ [POST /api/recovery/interventions] Successfully logged new recovery measure")

    # 8. Alerts
    res = client.get('/api/alerts')
    assert res.status_code == 200
    al = res.get_json()
    print(f"✓ [GET /api/alerts] Loaded {len(al['alerts'])} alerts")

    print("=" * 60)
    print("🎉 ALL BACKEND & ML TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
