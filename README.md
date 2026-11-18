# AquaShield: AI-Based Water Crisis Early Warning and Conservation Planning System

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/Academic-SJEC%20MCA%202026--27-1A365D)]()

**AquaShield** is a full-stack, AI-powered Decision Support System (DSS) designed to transition water resource management from **reactive** crisis response to **proactive, data-driven early intervention**.

* **Candidate:** Meghashree (USN: `4SO25MC064`)
* **Guide:** Dr. Hareesh B, Head of Department
* **Institution:** St Joseph Engineering College, Mangaluru (Autonomous Institution)
* **Department:** Department of Computer Applications (MCA)

---

## 🚀 Quick Start (One-Click Launch)

Simply double-click **`start_app.bat`** in this folder, or run the following two commands:

### Terminal 1 (Backend API)
```bash
python backend/app.py
# Runs on http://localhost:5000
```

### Terminal 2 (React Frontend)
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Pre-Seeded Demo Accounts (Role-Based Access)

Use these accounts to demonstrate the distinct role dashboards during project vivas:

| Role | Email | Password | Access & Dashboard Features |
| :--- | :--- | :--- | :--- |
| **Authority / Planner** | `planner@mangaluru.gov.in` | `planner123` | **Full AI Decision Suite:** Prophet forecasting, Random Forest risk classification, SHAP waterfall explainability, What-If simulator, and the Recovery Tracker. |
| **Citizen (Public)** | `citizen@gmail.com` | `citizen123` | **Public Portal:** Clean mobile-first water advisory badge, 7-day weather cards, municipal rationing alerts, domestic conservation tips. |
| **Administrator** | `admin@aquashield.org` | `admin123` | **Governance Console:** User management (role assignment), dataset health audit (5,113 rows), AI model registry. |

*(Tip: In the top-right of the dashboard, you can also use the **Quick Role Switcher** dropdown to toggle between roles with 1 click!)*

---

## 📊 Machine Learning Performance Metrics

* **Time-Series Forecasting (Facebook Prophet):**
  * Evaluated across 14 years (2010–2023) of daily Mangaluru climate records (5,113 points).
  * **MAE:** $3.41$ &nbsp;|&nbsp; **RMSE:** $3.88$ &nbsp;|&nbsp; **MAPE:** $5.5\%$
* **Risk Classification (Random Forest Classifier):**
  * 4-class balanced prediction (`Low`, `Medium`, `High`, `Critical`).
  * **Accuracy:** $96.87\%$ &nbsp;|&nbsp; **Macro F1-Score:** $96.88\%$
* **Threshold Validation (K-Means Clustering, $k=4$):**
  * $72.1\%$ natural cluster alignment validating data-driven percentile cutoffs ($P_{25}, P_{50}, P_{75}$).
* **Explainable AI (SHAP TreeExplainer):**
  * Quantifies exact positive and negative feature attributions for root-cause diagnosis.

---

## 🔄 The Closed-Loop Recovery Tracker

AquaShield's primary academic contribution is the **Recovery Tracker**, which connects model predictions with real-world outcomes:
$$\text{Risk Predicted} \longrightarrow \text{SHAP Root Cause} \longrightarrow \text{Targeted Intervention} \longrightarrow \text{Recovery Tracker Log} \longrightarrow \text{Empirical Recovery Curve}$$

Authorities log interventions (e.g. rainwater harvesting, borehole recharge wells, municipal rationing) and track whether water stress scores decline over a 30/60/90-day post-intervention period.

---

## 📄 Automated Report Export
Official executive PDF reports can be downloaded directly from the dashboard navbar or via:
`GET http://localhost:5000/api/report/download`
