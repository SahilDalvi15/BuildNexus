import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import xgboost as xgb
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'synthetic_sensor_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'src', 'models', 'predictive_maintenance_model.joblib')

def train_model():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print(f"Data not found at {DATA_PATH}. Please generate it first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Feature Engineering / Selection
    # Drop columns that are not predictors or leak the target
    # 'machine_id', 'timestamp', 'operating_status' are non-predictive for this
    features = [
        'temperature', 'vibration', 'pressure', 'current', 'voltage', 
        'energy_kwh', 'production_count', 'quality_score', 'is_weekend', 'hour',
        'temp_rolling_mean', 'vib_rolling_mean', 'temp_rate', 'vib_rate', 'energy_efficiency'
    ]
    target = 'failure_risk'

    # Ensure all features exist in the dataset
    missing_features = [f for f in features if f not in df.columns]
    if missing_features:
        print(f"Missing features in dataset: {missing_features}")
        return

    X = df[features]
    y = df[target]

    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{y.value_counts(normalize=True)}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)

    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred))
    print("--- Confusion Matrix ---")
    print(confusion_matrix(y_test, y_pred))

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved successfully at {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
