import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, DollarSign, CloudRain, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Energy() {
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const response = await axios.get(`${API_URL}/energy/overall`);
        setEnergyData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching energy metrics:", err);
        setError("Failed to load energy data. Please ensure the backend is running.");
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, []);

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>Loading energy metrics...</p>
      </div>
    );
  }

  if (error || !energyData || energyData.message) {
    return (
      <div className="page-content">
        <div className="card card-warning" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--warning)' }}>
          <AlertTriangle size={24} />
          <p>{error || energyData?.message || "Data not available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="energy-page">
      <div className="header-actions" style={{ marginBottom: '2rem' }}>
        <h1>Energy Intelligence</h1>
        <p>Factory-wide power consumption, financial impact, and carbon footprint.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Energy Consumption Card (Orange) */}
        <div className="card card-energy" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--energy)', color: 'white', borderRadius: '50%' }}>
            <Zap size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total Energy Consumed</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {parseFloat(energyData.totalEnergyKwH).toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kWh</span>
            </div>
          </div>
        </div>

        {/* Cost Impact Card (Green/Tealish) */}
        <div className="card card-secondary" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--secondary)', color: 'white', borderRadius: '50%' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Estimated Cost</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              ${parseFloat(energyData.totalCostUSD).toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>USD</span>
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Calculated at $0.12 / kWh</p>
          </div>
        </div>

        {/* CO2 Emissions Card (Teal/Blue) */}
        <div className="card card-primary" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%' }}>
            <CloudRain size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Carbon Footprint (CO₂)</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {parseFloat(energyData.totalCO2EmissionsKg).toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span>
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>0.38 kg / kWh factor</p>
          </div>
        </div>

      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Energy Insights</h3>
        <p style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          The total recorded energy consumption across all machines since initialization is <strong>{parseFloat(energyData.totalEnergyKwH).toLocaleString()} kWh</strong>, 
          averaging <strong>{parseFloat(energyData.averageEnergyKwH).toLocaleString()} kWh</strong> per historical reading. 
        </p>
        <p>
          This equates to a carbon footprint of <strong>{parseFloat(energyData.totalCO2EmissionsKg).toLocaleString()} kg of CO₂</strong>. 
          Monitor these metrics closely to hit the factory sustainability goals.
        </p>
      </div>

    </div>
  );
}
