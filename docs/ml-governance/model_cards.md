# ML Governance & Model Cards

This document outlines the capabilities, constraints, and ethical considerations for the machine learning models deployed within BuildNexus V3.0, adhering to the PRD (Section 21) requirements.

## 1. Predictive Maintenance Model (RUL)

### Model Details
- **Architecture:** Random Forest Regressor / Gradient Boosting Machine.
- **Input Features:** Temperature, Vibration, Power Consumption, Operating Hours.
- **Target Output:** Remaining Useful Life (RUL) in days, Risk Level (CRITICAL, WARNING, SAFE), and Failure Probability.

### Training Data & Reproducibility
- Trained on simulated NASADataset (CMAPSS) overlaid with synthetic industrial data.
- **Reproducible Training:** A training pipeline script (`train_quality_prediction.py`) handles identical seed initialization and cross-validation splits.

### Performance Metrics & Thresholds
- **Target Thresholds:** Requires Mean Absolute Error (MAE) < 15 days on test set.
- **Precision/Recall (Failure Classification):** Optimized for high recall (>90%) to avoid missing critical failures, at the expense of precision (more false positives).

### Limitations & Ethical Considerations
- **Causality vs Correlation:** The model relies on correlational data. High vibration predicts failure, but the model cannot inherently determine *why* vibration increased (e.g., loose bolt vs lack of lubrication). Root Cause Analysis (RCA) overlays are estimates based on feature importance (SHAP values), not definitive engineering diagnoses.

## 2. Energy Anomaly Detection Model

### Model Details
- **Architecture:** Isolation Forest / One-Class SVM.
- **Input Features:** Current Energy Consumption, Production Rate, Time of Day.
- **Target Output:** Anomaly Score, Boolean Flag (Is_Anomaly).

### Training Data & Reproducibility
- Unsupervised learning. Trained on baseline "normal" operating periods collected over 6 months of stable factory operations.

### Performance Metrics & Thresholds
- **Threshold:** Dynamic thresholding based on the 95th percentile of anomaly scores during validation.
- **Latency:** Inference is performed via the Flask API proxy and takes ~50ms. 

### Limitations & Ethical Considerations
- **Concept Drift:** Factory configurations change (new machines, differing production schedules). The model requires retraining every 30 days or after major line reconfiguration to prevent "normal" operations from being flagged as anomalies.

## 3. Quality Prediction Model

### Model Details
- **Architecture:** Logistic Regression / XGBoost Classifier.
- **Input Features:** Line speed, Raw material variance, Temperature profiles.
- **Target Output:** Probability of Defect.

### Limitations & Ethical Considerations
- **Bias:** If historical data includes systemic flaws (e.g., rejecting parts due to aesthetic flaws that don't affect function), the model will replicate this bias.
- **Human-in-the-Loop:** Predictions must be reviewed by QA personnel. The model should augment, not replace, physical quality inspections.
