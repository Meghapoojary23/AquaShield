import os
import sys
import sqlite3
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,)).fetchone()
    conn.close()

    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            },
            "token": f"aqua-session-{user['id']}-{user['role']}"
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    role = data.get('role', 'citizen').strip().lower()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if role not in ['admin', 'planner', 'citizen']:
        role = 'citizen'

    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Email is already registered"}), 409

    hashed_pw = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        (name, email, hashed_pw, role)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role
        }
    }), 201

@auth_bp.route('/users', methods=['GET'])
def list_users():
    conn = get_db_connection()
    users = conn.execute("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC").fetchall()
    conn.close()

    result = [dict(u) for u in users]
    return jsonify({"users": result}), 200

@auth_bp.route('/users/<int:user_id>/role', methods=['PUT'])
def update_user_role(user_id):
    data = request.get_json() or {}
    new_role = data.get('role', '').strip().lower()
    if new_role not in ['admin', 'planner', 'citizen']:
        return jsonify({"error": "Invalid role specified"}), 400

    conn = get_db_connection()
    conn.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": f"User #{user_id} updated to {new_role}"}), 200
