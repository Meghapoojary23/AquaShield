import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import MODELS_DIR
from ml.scoring import compute_water_stress_scores

MODEL_PATH = os.path.join(MODELS_DIR, "rf_model.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "rf_metrics.json")

FEATURE_COLS = [
    'precip_30d',
    'temp_30d_mean',
    'humidity',
    'evap_proxy',
    'gw_level_mbgl',
    'consecutive_dry_days',
    'solarradiation'
]

def train_risk_classifier(df=None):
    """
    Trains a Random Forest classifier on engineered climate features to predict
    Low, Medium, High, or Critical risk. Evaluates with F1, Accuracy, and Confusion Matrix.
    """
    if df is None or 'risk_level' not in df.columns:
        df, _ = compute_water_stress_scores()

    X = df[FEATURE_COLS].copy()
    y = df['risk_level'].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    macro_f1 = float(f1_score(y_test, y_pred, average='macro'))
    weighted_f1 = float(f1_score(y_test, y_pred, average='weighted'))
    
    classes = ['Low', 'Medium', 'High', 'Critical']
    cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()
    report = classification_report(y_test, y_pred, labels=classes, output_dict=True)

    # Global feature importances
    feature_importances = {
        feat: round(float(imp), 4)
        for feat, imp in zip(FEATURE_COLS, clf.feature_importances_)
    }

    metrics = {
        "accuracy": round(acc * 100, 2),
        "macro_f1": round(macro_f1 * 100, 2),
        "weighted_f1": round(weighted_f1 * 100, 2),
        "classes": classes,
        "confusion_matrix": cm,
        "feature_importances": feature_importances,
        "classification_report": report
    }

    # Save model and metrics
    joblib.dump(clf, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"✓ Random Forest Classifier trained successfully.")
    print(f"  Accuracy: {metrics['accuracy']}% | Macro F1: {metrics['macro_f1']}%")
    print(f"  Top Features: {sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)[:3]}")

    return clf, metrics

def load_risk_classifier():
    if os.path.exists(MODEL_PATH) and os.path.exists(METRICS_PATH):
        clf = joblib.load(MODEL_PATH)
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
        return clf, metrics
    return train_risk_classifier()

def predict_single_observation(observation_dict):
    """
    Takes a dict of feature values and returns predicted risk and class probabilities.
    """
    clf, _ = load_risk_classifier()
    row = [observation_dict.get(c, 0.0) for c in FEATURE_COLS]
    df_single = pd.DataFrame([row], columns=FEATURE_COLS)
    
    pred_class = clf.predict(df_single)[0]
    probs = clf.predict_proba(df_single)[0]
    
    class_probs = {c: round(float(p) * 100, 1) for c, p in zip(clf.classes_, probs)}
    return pred_class, class_probs

if __name__ == "__main__":
    clf, metrics = train_risk_classifier()
