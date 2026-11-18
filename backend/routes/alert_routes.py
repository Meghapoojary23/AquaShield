import os
import sys
from flask import Blueprint, request, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import get_db_connection

alert_bp = Blueprint('alerts', __name__)

@alert_bp.route('', methods=['GET'], strict_slashes=False)
@alert_bp.route('/', methods=['GET'], strict_slashes=False)
def list_alerts():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM alerts ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify({"alerts": [dict(r) for r in rows]}), 200

@alert_bp.route('', methods=['POST'], strict_slashes=False)
@alert_bp.route('/', methods=['POST'], strict_slashes=False)
def create_alert():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    severity = data.get('severity', 'HIGH').strip().upper()
    message = data.get('message', '').strip()

    if not title or not message:
        return jsonify({"error": "Title and message are required"}), 400

    if severity not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
        severity = 'HIGH'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO alerts (title, severity, message, status) VALUES (?, ?, ?, 'ACTIVE')",
        (title, severity, message)
    )
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"message": "Alert created successfully", "id": new_id}), 201

@alert_bp.route('/<int:id>/resolve', methods=['PUT'])
def resolve_alert(id):
    conn = get_db_connection()
    conn.execute("UPDATE alerts SET status = 'RESOLVED' WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Alert #{id} marked as RESOLVED"}), 200
