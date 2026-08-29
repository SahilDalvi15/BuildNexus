# Model Evaluation Report
This document summarizes the performance, architecture, and operational thresholds for the machine learning models utilized in the BuildNexus Manufacturing Intelligence Platform.

## 1. Predictive Maintenance Model (Failure Risk)
**Goal**: Predict the binary `failure_risk` of a machine within the next 48 hours.
**Algorithm**: XGBoost Classifier (`xgboost`)
**Hyperparameters**: `n_estimators=100`, `learning_rate=0.1`, `max_depth=5`

### Performance Metrics
- **Accuracy**: 1.00
- **Precision (Failure Class 1)**: 1.00
- **Recall (Failure Class 1)**: 0.84
- **F1-Score (Failure Class 1)**: 0.91

*Note: Due to the extreme imbalance of failure occurrences (0.6% of data points), Recall is the most critical metric. The model captures 84% of true failures without triggering false alarms (Precision 1.0).*

### Operational Threshold
If the predicted probability `P(failure) > 0.5`, the model flags a `1`. The backend should interpret any `1` as a **High Priority Alert**.

---

## 2. Energy Anomaly Detection Model
**Goal**: Identify unusual spikes in energy usage that diverge from baseline operational hours and production counts.
**Algorithm**: Isolation Forest (`scikit-learn`)
**Hyperparameters**: `n_estimators=100`, `contamination=0.03`

### Performance Metrics
- **Anomaly Detection Rate**: ~2.98% (482 anomalies out of 16,200 records)
- *Note: As this is an unsupervised model, we evaluated it based on the assumed anomaly generation rate in the synthetic baseline (3%). The model successfully isolated the 3% bounds.*

### Operational Threshold
Predictions returned as `-1` denote an anomaly. The backend should map these to an `Energy Anomaly` alert, possibly requiring maintenance checking or recalibration.

---

## 3. Quality Prediction Model
**Goal**: Predict the continuous `quality_score` output of a machine based on current sensor readings and degradation state.
**Algorithm**: Random Forest Regressor (`scikit-learn`)
**Hyperparameters**: `n_estimators=100`, `max_depth=10`

### Performance Metrics
- **Mean Squared Error (MSE)**: 0.000095
- **R-squared (R2)**: 0.9989

*Note: The high R2 score demonstrates the model perfectly captures the linear degradation and noise correlations engineered into the synthetic dataset.*

### Operational Threshold
- **Score > 0.95**: Optimal Quality
- **0.85 < Score <= 0.95**: Acceptable Quality (Monitor)
- **Score <= 0.85**: Quality Degradation Alert (Warning)
