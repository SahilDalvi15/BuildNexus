import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, AlertCircle, CheckCircle2, Factory } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Quality() {
  const [machines, setMachines] = useState([]);
  const [qualityData, setQualityData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQualityData = async () => {
      try {
        // Fetch all machines
        const machinesRes = await axios.get(`${API_URL}/machines`);
        const fetchedMachines = machinesRes.data.machines || machinesRes.data;
        setMachines(fetchedMachines);

        // For each machine, fetch quality prediction
        const qualityResults = {};
        for (const machine of fetchedMachines) {
          try {
            // Get latest sensor data for the machine
            const sensorRes = await axios.get(`${API_URL}/sensors/${machine.machineId}/latest`);
            const sensorData = sensorRes.data;

            if (sensorData) {
              // Send to ML service for quality prediction
              const predictRes = await axios.post(`${API_URL}/ml/predict-quality`, {
                machineId: machine.machineId,
                temperature: sensorData.readings.temperature,
                pressure: sensorData.readings.pressure,
                current: sensorData.readings.current,
                production_speed: 100 // Simulated or derived
              });
              qualityResults[machine.machineId] = predictRes.data;
            }
          } catch (error) {
            console.error(`Failed to fetch quality data for ${machine.machineId}`, error);
          }
        }
        
        setQualityData(qualityResults);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load quality data.");
        setLoading(false);
      }
    };

    fetchQualityData();
  }, []);

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>Analyzing quality predictions...</p>
      </div>
    );
  }

  const getRiskColor = (prob) => {
    if (prob > 70) return 'var(--danger)';
    if (prob > 40) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="quality-page">
      <div className="header-actions" style={{ marginBottom: '2rem' }}>
        <h1>Quality Intelligence</h1>
        <p>Real-time defect predictions and parameter recommendations to ensure product quality.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {machines.map((machine) => {
          const prediction = qualityData[machine.machineId];
          if (!prediction) return null;

          const defectProb = prediction.defect_probability;
          const riskColor = getRiskColor(defectProb);

          return (
            <div key={machine._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Factory size={20} color="var(--primary)" />
                  {machine.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: riskColor, fontWeight: 'bold' }}>
                  {defectProb > 70 ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  <span>{defectProb.toFixed(1)}% Defect Risk</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Expected Quality Score</p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    {prediction.quality_score}/100
                  </p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: riskColor }}>
                    {prediction.risk_level}
                  </p>
                </div>
              </div>

              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Target size={16} /> AI Recommendations
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
