import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'synthetic_sensor_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'src', 'models', 'quality_prediction_model.joblib')

def train_model():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print(f"Data not found at {DATA_PATH}. Please generate it first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Feature Selection for Quality Prediction
    features = [
        'temperature', 'vibration', 'pressure', 'current', 'voltage', 
        'energy_kwh', 'production_count', 'hour', 'temp_rolling_mean', 
        'vib_rolling_mean', 'temp_rate', 'vib_rate'
    ]
    target = 'quality_score'
    
    # Ensure all features exist in the dataset
    missing_features = [f for f in features if f not in df.columns]
    if missing_features:
        print(f"Missing features in dataset: {missing_features}")
        return

    X = df[features]
    y = df[target]
    print(f"Dataset shape for Quality Prediction: {X.shape}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Mean Squared Error (MSE): {mse:.6f}")
    print(f"R-squared (R2): {r2:.6f}")

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved successfully at {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
