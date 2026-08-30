import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Tool, Activity, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Production() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get(`${API_URL}/machines`);
        setMachines(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching machines:", err);
        setError("Failed to load machine data. Please ensure the backend is running.");
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>Loading machines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="card card-warning" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--warning)' }}>
          <AlertTriangle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'RUNNING': return <span className="badge badge-success">RUNNING</span>;
      case 'MAINTENANCE': return <span className="badge badge-warning">MAINTENANCE</span>;
      case 'OFFLINE': return <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>OFFLINE</span>;
      case 'ERROR': return <span className="badge badge-warning" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>ERROR</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="production-page">
      <div className="header-actions" style={{ marginBottom: '2rem' }}>
        <h1>Production & KPIs</h1>
        <p>Overview of all factory machines and their current statuses.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {machines.map((machine) => (
          <div key={machine._id} className="card card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} color="var(--secondary)" />
                {machine.name}
              </h3>
              {getStatusBadge(machine.status)}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Machine ID:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{machine.machineId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{machine.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Location:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{machine.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Maintenance:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                  {new Date(machine.lastMaintenanceDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" style={{ flex: 1, marginRight: '0.5rem' }}>
                <Activity size={16} /> Metrics
              </button>
              <button className="btn btn-ai" style={{ flex: 1, marginLeft: '0.5rem' }}>
                <Tool size={16} /> Service
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
