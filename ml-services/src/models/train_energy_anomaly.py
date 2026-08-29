import os
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'synthetic_sensor_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'src', 'models', 'energy_anomaly_model.joblib')

def train_model():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print(f"Data not found at {DATA_PATH}. Please generate it first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Feature Selection for Energy Anomaly Detection
    # Using energy consumption, production count, and time of day
    features = ['energy_kwh', 'production_count', 'hour', 'energy_efficiency']
    
    # Ensure all features exist in the dataset
    missing_features = [f for f in features if f not in df.columns]
    if missing_features:
        print(f"Missing features in dataset: {missing_features}")
        return

    X = df[features]
    
    # Split the data into Training and Testing sets
    X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)
    
    print(f"Training dataset shape: {X_train.shape}")
    print(f"Testing dataset shape: {X_test.shape}")

    print("Training Isolation Forest on Training Data...")
    # Contamination defines the expected proportion of outliers.
    # In our generator, we had 3 anomaly days per machine out of 90, meaning roughly ~3% of days are anomalous.
    model = IsolationForest(n_estimators=100, contamination=0.03, random_state=42)
    
    model.fit(X_train)

    print("Predicting anomalies on Unseen Test Data...")
    # Predict anomalies (-1 for anomalies, 1 for normal)
    predictions = model.predict(X_test)
    
    # Convert predictions to 1 (anomaly) and 0 (normal) for easier interpretation
    anomalies = (predictions == -1).sum()
    print(f"Detected {anomalies} anomalies out of {len(X_test)} test records ({(anomalies/len(X_test))*100:.2f}%).")

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved successfully at {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
