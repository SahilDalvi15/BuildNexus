# Dataset Card: Synthetic Sensor Data

## Dataset Overview
* **Dataset Name:** `synthetic_sensor_data.csv`
* **Generated On:** 2026-08-30
* **Total Rows:** ~54,000
* **Time Span:** 90 Days

## Purpose
This dataset was synthetically generated to train machine learning models for the BuildNexus prototype. It simulates a factory floor containing 30 unique machines, representing typical manufacturing environments.

## Data Generation Methodology
The data was generated using a custom Python script (`data_generator.py`) utilizing NumPy and Pandas. The generation rules include:
* **Base Profiles:** Each machine type (e.g., CNC, Press, Furnace) has a unique baseline for temperature, pressure, current, and vibration.
* **Temporal Patterns:** Data includes diurnal (day/night) cycles and weekend reduction in activity.
* **Degradation Simulation:** Bearing wear and gradual temperature increases were mathematically injected over time to simulate equipment aging.
* **Failure Injection:** Sudden spikes in vibration and temperature were injected immediately preceding a labeled `is_failure` event.
* **Quality Degradation:** Quality scores drift lower as machine parameters approach their critical safety limits.

## Schema
* `machine_id`: Unique identifier (String)
* `timestamp`: ISO-8601 Datetime
* `temperature`: degrees Celsius (Float)
* `vibration`: mm/s (Float)
* `pressure`: bar (Float)
* `current`: Amps (Float)
* `voltage`: Volts (Float)
* `energy_kwh`: Energy consumed in interval (Float)
* `production_count`: Units produced (Integer)
* `quality_score`: 0-100 score (Float)
* `operating_status`: Enum (RUNNING, IDLE, ERROR)
* `is_failure`: Ground truth label for maintenance (Boolean)
* `is_anomaly`: Ground truth label for energy (Boolean)

## Known Limitations
* The data is perfectly deterministic and lacks the true chaotic noise found in real-world IIoT (Industrial IoT) environments.
* Correlation does not equal causation, but in this synthetic dataset, causal links were mathematically forced (e.g., higher vibration *causes* lower quality). Models trained on this data will over-index on these artificial correlations.
