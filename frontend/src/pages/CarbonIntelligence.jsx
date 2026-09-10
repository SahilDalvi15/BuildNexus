import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Factory, Truck, Zap, AlertTriangle, Info, Database } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ScopeCard = ({ scope, label, icon: Icon, color, data }) => (
  <div className="card hover-lift h-100">
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div className="d-flex align-items-center gap-3">
        <div className="p-3 rounded-circle" style={{ backgroundColor: color, color: '#fff' }}>
          <Icon size={28} />
        </div>
        <div>
          <h5 className="text-white mb-0">{label}</h5>
          <span className="badge bg-dark border mt-1">{scope}</span>
        </div>
      </div>
    </div>
    {data ? (
      <>
        <div className="fs-2 fw-bold text-white mb-1">
          {(data.emissionsKg / 1000).toFixed(2)} <span className="fs-6 text-muted">tCO₂e</span>
        </div>
        <div className="row g-2 mt-2">
          <div className="col-6">
            <div className="p-2 bg-dark rounded border border-secondary text-center">
              <div className="text-muted small">Factor Applied</div>
              <div className="fw-semibold text-white">{data.factorApplied}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2 bg-dark rounded border border-secondary text-center">
              <div className="text-muted small">Source</div>
              <div className="fw-semibold text-white small">{data.source}</div>
            </div>
          </div>
        </div>
        {data.isEstimate && (
          <div className="mt-3 d-flex align-items-center gap-2 text-warning small">
            <Info size={14} /> This is an estimated value (Scope 3)
          </div>
        )}
      </>
    ) : (
      <p className="text-muted">No data available</p>
    )}
  </div>
);

export default function CarbonIntelligence() {
  const [summary, setSummary] = useState(null);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [summaryRes, factorsRes] = await Promise.all([
        axios.get(`${API_URL}/carbon/summary`, { headers }),
        axios.get(`${API_URL}/carbon/factors`, { headers })
      ]);
      setSummary(summaryRes.data.data);
      setFactors(factorsRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching carbon data:", err);
      setError("Failed to load carbon intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in page-content">
        <div className="card card-warning d-flex align-items-center gap-3 text-warning">
          <AlertTriangle size={24} />
          <p className="m-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-1">Carbon Intelligence</h1>
          <p className="page-subtitle">Scope 1, 2, and 3 emissions powered by configurable emission factors.</p>
        </div>
      </div>

      {/* Total Emissions Banner */}
      {summary && (
        <div className="card mb-4" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="row align-items-center">
            <div className="col-md-4">
              <h6 className="text-muted mb-1">Total Plant Emissions</h6>
              <div className="fs-2 fw-bold text-white">
                {summary.totalTCO2e.toFixed(2)} <span className="fs-6 text-muted">tCO₂e</span>
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="text-muted mb-1">Production Volume</h6>
              <div className="fs-4 fw-bold text-white">
                {summary.productionUnits.toLocaleString()} <span className="fs-6 text-muted">units</span>
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="text-muted mb-1">Carbon Intensity</h6>
              <div className="fs-4 fw-bold text-success">
                {(summary.carbonIntensity * 1000).toFixed(4)} <span className="fs-6 text-muted">kgCO₂e / unit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scope Breakdown */}
      <div className="row g-4 mb-5">
        <div className="col-lg-4">
          <ScopeCard
            scope="Scope 1"
            label="Direct Emissions"
            icon={Factory}
            color="#e74c3c"
            data={summary?.scope1}
          />
        </div>
        <div className="col-lg-4">
          <ScopeCard
            scope="Scope 2"
            label="Purchased Electricity"
            icon={Zap}
            color="#3498db"
            data={summary?.scope2}
          />
        </div>
        <div className="col-lg-4">
          <ScopeCard
            scope="Scope 3"
            label="Value Chain (Estimated)"
            icon={Truck}
            color="#9b59b6"
            data={summary?.scope3}
          />
        </div>
      </div>

      {/* Active Emission Factors Table */}
      <h4 className="mb-3 d-flex align-items-center">
        <Database className="me-2 text-info" size={22} /> Active Emission Factors
      </h4>
      <p className="text-muted mb-4">These factors power all carbon calculations across BuildNexus.</p>

      <div className="card">
        {factors.length === 0 ? (
          <p className="text-muted text-center py-4 m-0">No emission factors configured. Defaults are being used.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scope</th>
                  <th>Category</th>
                  <th>Factor</th>
                  <th>Unit</th>
                  <th>Source</th>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f) => (
                  <tr key={f._id}>
                    <td className="fw-semibold">{f.name}</td>
                    <td>
                      <span className={`badge ${f.scope === 'SCOPE_1' ? 'bg-danger' : f.scope === 'SCOPE_2' ? 'bg-primary' : 'bg-purple'}`}>
                        {f.scope.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{f.category}</td>
                    <td className="fw-bold">{f.factorValue}</td>
                    <td className="text-muted">{f.unit}</td>
                    <td>{f.source}</td>
                    <td><span className="badge bg-dark border">{f.version}</span></td>
                    <td>
                      <span className={`badge ${f.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
