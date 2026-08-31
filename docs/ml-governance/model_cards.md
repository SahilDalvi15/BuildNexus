# Machine Learning Model Cards

This document outlines the governance and metadata for the machine learning models deployed in the BuildNexus Manufacturing Intelligence Platform.

> **Disclaimer:** These models are trained on synthetic data for demonstration purposes. They are not intended for deployment in real-world Saint-Gobain facilities without retraining on actual telemetry data.

---

## 1. Predictive Maintenance Model

### Model Details
* **Model Name:** `predictive_maintenance_model`
* **Version:** 1.0.0
* **Algorithm:** XGBoost Classifier
* **Training Date:** 2026-08-30

### Intended Use
* **Primary Use Case:** Predict the probability of a machine failing within a 48-hour horizon based on current and historical telemetry.
* **Out-of-Scope Use:** Not to be used to automatically shut down equipment without human intervention.

### Data & Features
* **Dataset:** Synthetic telemetry data (`synthetic_sensor_data.csv`).
* **Features Used:** `temperature`, `vibration`, `pressure`, `current`, `energy_kwh`, `operating_hours`, `production_count`, `temp_rolling_mean`, `vib_rolling_mean`, `temp_rate`.
* **Target:** Binary classification (`failure_imminent` - 1 or 0).

### Evaluation Metrics
* **F1-Score:** ~0.85
* **Precision:** 0.83
* **Recall:** 0.87
* **ROC-AUC:** 0.93

### Considerations & Limitations
* **Thresholds:** A threshold of `0.70` probability is used to categorize risk as "HIGH".
* **Failure Modes:** False positives may occur during planned stress testing. The model is highly sensitive to sudden vibration spikes which may occasionally represent sensor noise rather than mechanical wear.

---

## 2. Energy Anomaly Detection Model

### Model Details
* **Model Name:** `energy_anomaly_model`
* **Version:** 1.0.0
* **Algorithm:** Isolation Forest (Unsupervised)
* **Training Date:** 2026-08-30

### Intended Use
* **Primary Use Case:** Identify abnormal spikes or drops in energy consumption that deviate from expected operational profiles.
* **Out-of-Scope Use:** Cannot identify *what* specific component is causing the anomaly, only that the total draw is abnormal.

### Data & Features
* **Dataset:** Normal operation subset of synthetic telemetry data.
* **Features Used:** `energy_kwh`, `production_count`, `hour_of_day`, `day_of_week`.

### Evaluation Metrics
* **F1-Score:** ~0.78 (on synthetic labeled anomalies)
* **Precision:** 0.75
* **Recall:** 0.82

### Considerations & Limitations
* **Thresholds:** A contamination rate of `0.05` was assumed during training. 
* **Failure Modes:** Shifts in production schedules (e.g., unexpected weekend shifts) will trigger false anomalies unless the model is retrained on the new schedule baseline.

---

## 3. Quality Defect Prediction Model

### Model Details
* **Model Name:** `quality_prediction_model`
* **Version:** 1.0.0
* **Algorithm:** XGBoost Regressor (Mapped to Probability)
* **Training Date:** 2026-08-31

### Intended Use
* **Primary Use Case:** Predict the likelihood of manufacturing defects based on real-time operating parameters to serve as decision-support for operators.
* **Out-of-Scope Use:** Not a causal model. Changing parameters *exactly* as recommended does not guarantee a defect-free product; it only moves the machine back to a statistically safer operating zone.

### Data & Features
* **Dataset:** Synthetic telemetry data.
* **Features Used:** `temperature`, `pressure`, `current`, `production_speed`.
* **Target:** Continuous `quality_score` (0-100), transformed into a defect probability.

### Evaluation Metrics
* **R² Score:** 0.85
* **RMSE:** 4.2
* **MAE:** 3.1

### Considerations & Limitations
* **Failure Modes:** The model assumes raw material quality is constant. If a bad batch of raw material is introduced, the model will vastly underestimate defect risk.
