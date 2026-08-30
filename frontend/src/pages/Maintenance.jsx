import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, AlertTriangle, Activity, CheckCircle, Target } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Maintenance() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Fetch machines to populate the dropdown
    const fetchMachines = async () => {
      try {
        const response = await axios.get(`${API_URL}/machines`);
        const machineList = response.data.machines || response.data;
        setMachines(machineList);
        if (machineList.length > 0) {
          setSelectedMachine(machineList[0].machineId);
        }
      } catch (err) {
        console.error("Failed to load machines", err);
      }
    };
    fetchMachines();
  }, []);

  const runDiagnostics = async () => {
    if (!selectedMachine) return;
    setRunning(true);
    
    try {
      // Generate realistic mock sensor data for the ML model
      const mockSensorData = {
        temperature: 75 + Math.random() * 20,
        vibration: 0.5 + Math.random() * 2.5,
        pressure: 100 + Math.random() * 20,
        current: 10 + Math.random() * 5,
        voltage: 220 + Math.random() * 10,
        energy_kwh: 50 + Math.random() * 20,
        production_count: 500 + Math.floor(Math.random() * 100),
        quality_score: 0.85 + Math.random() * 0.1,
        is_weekend: new Date().getDay() === 0 || new Date().getDay() === 6 ? 1 : 0,
        hour: new Date().getHours(),
        temp_rolling_mean: 75 + Math.random() * 5,
        vib_rolling_mean: 0.5 + Math.random() * 0.5,
        temp_rate: Math.random() * 0.1,
        vib_rate: Math.random() * 0.05,
        energy_efficiency: 0.9 + Math.random() * 0.1
      };

      // Call the ML endpoints in parallel
      const [failureRes, anomalyRes, qualityRes] = await Promise.all([
        axios.post(`${API_URL}/ml/predict-failure`, mockSensorData),
        axios.post(`${API_URL}/ml/predict-anomaly`, mockSensorData),
        axios.post(`${API_URL}/ml/predict-quality`, mockSensorData)
      ]);

      setResults({
        failure: failureRes.data,
        anomaly: anomalyRes.data,
        quality: qualityRes.data,
        sensorData: mockSensorData
      });

    } catch (err) {
      console.error("Diagnostics failed", err);
      alert("Failed to run diagnostics. Is the ML Python service running on port 5001?");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="maintenance-page">
      <div className="header-actions" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BrainCircuit color="var(--ai)" />
          Predictive Maintenance & Quality
        </h1>
        <p>Run advanced AI/ML diagnostics on factory equipment.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Select Equipment</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <select 
            value={selectedMachine} 
            onChange={(e) => setSelectedMachine(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
          >
            {machines.map(m => (
              <option key={m.machineId} value={m.machineId}>{m.name} ({m.machineId})</option>
            ))}
          </select>
          <button 
            className="btn btn-ai" 
            onClick={runDiagnostics} 
            disabled={running || machines.length === 0}
            style={{ minWidth: '150px' }}
          >
            {running ? "Analyzing..." : "Run AI Diagnostics"}
          </button>
        </div>
      </div>

      {results && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Diagnostic Results for {selectedMachine}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Failure Risk (XGBoost) */}
            <div className={`card ${results.failure.failure_risk === 1 ? 'card-warning' : 'card-ai'}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle color={results.failure.failure_risk === 1 ? 'var(--warning)' : 'var(--ai)'} size={20} />
                  Failure Risk
                </h3>
                <span className={`badge ${results.failure.failure_risk === 1 ? 'badge-warning' : 'badge-ai'}`}>
                  XGBoost
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0', color: results.failure.failure_risk === 1 ? 'var(--warning)' : 'var(--text-main)' }}>
                {results.failure.failure_risk === 1 ? 'HIGH RISK' : 'LOW RISK'}
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Probability: {((results.failure.probability || 0) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Quality Prediction (Random Forest) */}
            <div className="card card-ai">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target color="var(--ai)" size={20} />
                  Predicted Quality
                </h3>
                <span className="badge badge-ai">Random Forest</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0', color: 'var(--text-main)' }}>
                {(results.quality.quality_score * 100).toFixed(1)}%
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Expected production yield quality based on current sensor parameters.
              </p>
            </div>

            {/* Anomaly Detection (Isolation Forest) */}
            <div className={`card ${results.anomaly.is_anomaly ? 'card-warning' : 'card-secondary'}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity color={results.anomaly.is_anomaly ? 'var(--warning)' : 'var(--secondary)'} size={20} />
                  Energy Anomaly
                </h3>
                <span className="badge" style={{ backgroundColor: '#e2e8f0' }}>Isolation Forest</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0', color: results.anomaly.is_anomaly ? 'var(--warning)' : 'var(--secondary)' }}>
                {results.anomaly.is_anomaly ? 'DETECTED' : 'NORMAL'}
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                {results.anomaly.is_anomaly ? 'Unusual energy consumption pattern detected.' : 'Power draw is within historical norms.'}
              </p>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
