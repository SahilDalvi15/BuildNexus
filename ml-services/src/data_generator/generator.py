import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Configuration
NUM_MACHINES = 30
DAYS = 90
HOURS = range(8, 20, 2)  # 8 AM to 8 PM, every 2 hours (6 readings per day)
MACHINE_TYPES = ['CNC_MILLING', 'CNC_LATHE', 'FURNACE', 'CONVEYOR', 'PRESS', 'GRINDER']
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'synthetic_sensor_data.csv')

def _generate_machine_baselines():
    np.random.seed(42)
    machines = []
    for i in range(1, NUM_MACHINES + 1):
        machine_type = np.random.choice(MACHINE_TYPES)
        # Baselines depend on machine type
        if machine_type == 'FURNACE':
            temp_base = 500
            vib_base = 10
            pres_base = 15
        elif machine_type == 'PRESS':
            temp_base = 60
            vib_base = 80
            pres_base = 120
        else:
            temp_base = 75
            vib_base = 25
            pres_base = 35

        machines.append({
            'machine_id': f'M-{i:03d}',
            'type': machine_type,
            'temp_base': temp_base + np.random.normal(0, 5),
            'vib_base': vib_base + np.random.normal(0, 2),
            'pres_base': pres_base + np.random.normal(0, 3),
            'curr_base': 15 + np.random.normal(0, 2),
            'volt_base': 220 + np.random.normal(0, 5),
            'energy_base': 50 + np.random.normal(0, 5),
            'quality_base': 0.98,
            # Attributes for simulating failures
            'degradation_rate': np.random.uniform(0.0001, 0.001),
            'failure_day': np.random.choice([np.nan, np.random.randint(30, 85)], p=[0.7, 0.3]),
            'anomaly_days': np.random.choice(range(10, DAYS), size=3, replace=False)
        })
    return pd.DataFrame(machines)

def _generate_machine_data(machines_df):
    records = []
    start_date = datetime.now() - timedelta(days=DAYS)
    
    for _, machine in machines_df.iterrows():
        machine_id = machine['machine_id']
        deg_factor = 0
        
        for day in range(DAYS):
            current_date = start_date + timedelta(days=day)
            is_weekend = 1 if current_date.weekday() >= 5 else 0
            
            # Increase degradation over time
            deg_factor += machine['degradation_rate']
            
            # Check for failure approach
            is_failing = False
            if pd.notna(machine['failure_day']) and day >= machine['failure_day'] - 5 and day < machine['failure_day']:
                is_failing = True
                deg_factor *= 1.2  # Accelerate degradation
                
            is_anomaly_day = day in machine['anomaly_days']
            
            for hour in HOURS:
                # Add noise
                noise = np.random.normal(0, 0.05)
                
                # Adjust for weekend/off-hours
                activity_multiplier = 0.5 if is_weekend else 1.0
                
                # Generate readings
                temp = machine['temp_base'] * (1 + noise + deg_factor) * activity_multiplier
                vib = machine['vib_base'] * (1 + noise + (deg_factor * 2)) * activity_multiplier
                pres = machine['pres_base'] * (1 + noise) * activity_multiplier
                curr = machine['curr_base'] * (1 + noise + deg_factor) * activity_multiplier
                volt = machine['volt_base'] * (1 + np.random.normal(0, 0.01))
                
                # Energy calculation
                energy = machine['energy_base'] * activity_multiplier * (1 + (deg_factor * 0.5))
                if is_anomaly_day and hour == 14: # Spike at 2 PM on anomaly days
                    energy *= np.random.uniform(1.3, 1.8) 
                
                # Quality score
                quality = max(0.6, machine['quality_base'] - (deg_factor * 0.5) + np.random.normal(0, 0.01))
                
                # Operating status
                status = 'RUNNING' if activity_multiplier == 1.0 else 'IDLE'
                if pd.notna(machine['failure_day']) and day >= machine['failure_day']:
                    status = 'ERROR'
                    temp, vib, pres, curr, energy, quality = 0, 0, 0, 0, 0, 0
                
                # Failure risk label (1 if failing within next 48 hours / 2 days)
                # Since failure_day is day index, check if failure_day is within next 2 days
                failure_risk = 0
                if pd.notna(machine['failure_day']):
                    if 0 < (machine['failure_day'] - day) <= 2:
                        failure_risk = 1
                
                records.append({
                    'machine_id': machine_id,
                    'timestamp': current_date.replace(hour=hour, minute=0, second=0, microsecond=0),
                    'temperature': round(temp, 2),
                    'vibration': round(vib, 2),
                    'pressure': round(pres, 2),
                    'current': round(curr, 2),
                    'voltage': round(volt, 2),
                    'energy_kwh': round(energy, 2),
                    'production_count': int(100 * activity_multiplier * (1 - min(0.5, deg_factor))),
                    'quality_score': round(quality, 4),
                    'operating_status': status,
                    'failure_risk': failure_risk,
                    'is_weekend': is_weekend,
                    'hour': hour
                })
                
    return pd.DataFrame(records)

def _add_derived_features(df):
    # Sort by machine and timestamp
    df = df.sort_values(by=['machine_id', 'timestamp']).reset_index(drop=True)
    
    # Calculate rolling means and rates of change per machine
    df['temp_rolling_mean'] = df.groupby('machine_id')['temperature'].transform(lambda x: x.rolling(window=6, min_periods=1).mean())
    df['vib_rolling_mean'] = df.groupby('machine_id')['vibration'].transform(lambda x: x.rolling(window=6, min_periods=1).mean())
    df['temp_rate'] = df.groupby('machine_id')['temperature'].transform(lambda x: x.diff().fillna(0))
    df['vib_rate'] = df.groupby('machine_id')['vibration'].transform(lambda x: x.diff().fillna(0))
    
    # Energy efficiency (Production per kWh)
    df['energy_efficiency'] = np.where(df['energy_kwh'] > 0, df['production_count'] / df['energy_kwh'], 0)
    
    # Round derived features
    df = df.round(4)
    return df

def generate_sensor_data():
    print("Generating machine baselines...")
    machines_df = _generate_machine_baselines()
    
    print("Simulating sensor readings...")
    data_df = _generate_machine_data(machines_df)
    
    print("Adding derived features...")
    final_df = _add_derived_features(data_df)
    
    return final_df

def save_data(df):
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Data saved to {OUTPUT_PATH}")
    print(f"Total rows: {len(df)}")
    print(df.head())

if __name__ == '__main__':
    df = generate_sensor_data()
    save_data(df)
