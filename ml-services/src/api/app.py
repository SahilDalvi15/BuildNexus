import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Base Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'src', 'models')

# Load Models
try:
    predictive_maintenance_model = joblib.load(os.path.join(MODELS_DIR, 'predictive_maintenance_model.joblib'))
    energy_anomaly_model = joblib.load(os.path.join(MODELS_DIR, 'energy_anomaly_model.joblib'))
    quality_prediction_model = joblib.load(os.path.join(MODELS_DIR, 'quality_prediction_model.joblib'))
    print("All models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    predictive_maintenance_model = None
    energy_anomaly_model = None
    quality_prediction_model = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success",
        "message": "ML Service API is running",
        "models_loaded": all([predictive_maintenance_model, energy_anomaly_model, quality_prediction_model])
    })

@app.route('/predict/failure', methods=['POST'])
def predict_failure():
    """
    Predicts the failure risk (0 or 1)
    """
    if not predictive_maintenance_model:
        return jsonify({"error": "Model not loaded"}), 500
        
    try:
        data = request.json
        # Expected features: temperature, vibration, pressure, current, voltage, energy_kwh, 
        # production_count, quality_score, is_weekend, hour, temp_rolling_mean, vib_rolling_mean, 
        features = [
            'temperature', 'vibration', 'pressure', 'current', 'voltage', 
            'energy_kwh', 'production_count', 'quality_score', 'is_weekend', 'hour',
            'temp_rolling_mean', 'vib_rolling_mean', 'temp_rate', 'vib_rate', 'energy_efficiency'
        ]
        
        df = pd.DataFrame([data])[features]
        prediction = predictive_maintenance_model.predict(df)[0]
        
        # Get probability of failure (Class 1) if supported
        prob = None
        if hasattr(predictive_maintenance_model, "predict_proba"):
            prob = float(predictive_maintenance_model.predict_proba(df)[0][1])
            
        return jsonify({
            "failure_risk": int(prediction),
            "probability": prob
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict/anomaly', methods=['POST'])
def predict_anomaly():
    """
    Predicts if the energy reading is an anomaly (True or False)
    """
    if not energy_anomaly_model:
        return jsonify({"error": "Model not loaded"}), 500
        
    try:
        data = request.json
        # Expected features: energy_kwh, production_count, hour, energy_efficiency
        features = ['energy_kwh', 'production_count', 'hour', 'energy_efficiency']
        
        df = pd.DataFrame([data])[features]
        prediction = energy_anomaly_model.predict(df)[0]
        
        # IsolationForest outputs -1 for outliers, 1 for inliers
        is_anomaly = True if prediction == -1 else False
        
        return jsonify({
            "is_anomaly": is_anomaly
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict/quality', methods=['POST'])
def predict_quality():
    """
    Predicts the quality score
    """
    if not quality_prediction_model:
        return jsonify({"error": "Model not loaded"}), 500
        
    try:
        data = request.json
        # Expected features: temperature, vibration, pressure, current, voltage, energy_kwh, 
        # production_count, hour, temp_rolling_mean, vib_rolling_mean, temp_rate, vib_rate
        features = [
            'temperature', 'vibration', 'pressure', 'current', 'voltage', 
            'energy_kwh', 'production_count', 'hour', 'temp_rolling_mean', 
            'vib_rolling_mean', 'temp_rate', 'vib_rate'
        ]
        
        df = pd.DataFrame([data])[features]
        prediction = quality_prediction_model.predict(df)[0]
        
        return jsonify({
            "quality_score": float(prediction)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # Run on port 5001 to avoid conflicting with the Node backend on 5000
    app.run(host='0.0.0.0', port=5001, debug=True)
