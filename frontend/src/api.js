const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(name, email, password, role) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/auth/users`);
    return res.json();
  },

  async updateUserRole(id, role) {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  // Climate & EDA Data
  async getDataSummary() {
    const res = await fetch(`${API_BASE_URL}/data/summary`);
    return res.json();
  },

  async getDataHistory(days = 180) {
    const res = await fetch(`${API_BASE_URL}/data/history?days=${days}`);
    return res.json();
  },

  async getEdaStats() {
    const res = await fetch(`${API_BASE_URL}/data/eda`);
    return res.json();
  },

  // Forecast
  async getForecast(horizon = 90) {
    const res = await fetch(`${API_BASE_URL}/forecast?horizon=${horizon}`);
    return res.json();
  },

  async recalculateForecast(horizon = 90) {
    const res = await fetch(`${API_BASE_URL}/forecast/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horizon })
    });
    return res.json();
  },

  // Risk & SHAP
  async getCurrentRisk() {
    const res = await fetch(`${API_BASE_URL}/risk/current`);
    return res.json();
  },

  async simulateRisk(params) {
    const res = await fetch(`${API_BASE_URL}/risk/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getRiskMetrics() {
    const res = await fetch(`${API_BASE_URL}/risk/metrics`);
    return res.json();
  },

  // Recovery Tracker
  async getInterventions() {
    const res = await fetch(`${API_BASE_URL}/recovery/interventions`);
    return res.json();
  },

  async addIntervention(payload) {
    const res = await fetch(`${API_BASE_URL}/recovery/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async updateInterventionStatus(id, status, current_stress) {
    const res = await fetch(`${API_BASE_URL}/recovery/interventions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, current_stress })
    });
    return res.json();
  },

  // Alerts
  async getAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    return res.json();
  },

  async createAlert(title, severity, message) {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, severity, message })
    });
    return res.json();
  },

  async resolveAlert(id) {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}/resolve`, {
      method: 'PUT'
    });
    return res.json();
  },

  // PDF Report URL
  getReportDownloadUrl() {
    return `${API_BASE_URL}/report/download`;
  }
};
