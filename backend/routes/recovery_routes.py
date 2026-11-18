import os
import sys
import sqlite3
from flask import Blueprint, request, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import get_db_connection

recovery_bp = Blueprint('recovery', __name__)

@recovery_bp.route('/interventions', methods=['GET'])
def list_interventions():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM interventions ORDER BY id DESC").fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        # Compute recovery percentage
        base = item.get('baseline_stress') or 75.0
        curr = item.get('current_stress') or base
        reduction = max(0, base - curr)
        recovery_pct = round((reduction / base) * 100, 1) if base > 0 else 0
        item['recovery_pct'] = recovery_pct
        result.append(item)

    return jsonify({"interventions": result}), 200

@recovery_bp.route('/interventions', methods=['POST'])
def add_intervention():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    category = data.get('category', 'Conservation Measure').strip()
    location = data.get('location', 'Mangaluru Region').strip()
    start_date = data.get('start_date', '').strip()
    description = data.get('description', '').strip()
    target_metric = data.get('target_metric', 'Water Stress Score Reduction').strip()
    baseline_stress = float(data.get('baseline_stress', 75.0))
    created_by = data.get('created_by', 'Authority Planner')

    if not title or not start_date:
        return jsonify({"error": "Title and start date are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO interventions 
        (title, category, location, start_date, description, target_metric, baseline_stress, current_stress, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', ?)
    """, (title, category, location, start_date, description, target_metric, baseline_stress, baseline_stress, created_by))
    
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Intervention logged in Recovery Tracker successfully",
        "id": new_id
    }), 201

@recovery_bp.route('/interventions/<int:id>/status', methods=['PUT'])
def update_status(id):
    data = request.get_json() or {}
    status = data.get('status', 'IN_PROGRESS')
    current_stress = data.get('current_stress')

    conn = get_db_connection()
    if current_stress is not None:
        conn.execute("UPDATE interventions SET status = ?, current_stress = ? WHERE id = ?", (status, float(current_stress), id))
    else:
        conn.execute("UPDATE interventions SET status = ? WHERE id = ?", (status, id))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Intervention #{id} updated to {status}"}), 200
