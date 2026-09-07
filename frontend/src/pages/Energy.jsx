import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, DollarSign, CloudRain, AlertTriangle, TrendingUp, Lightbulb, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Energy() {
  const [energyData, setEnergyData] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [energyRes, oppRes] = await Promise.all([
        axios.get(`${API_URL}/energy/overall`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API_URL}/energy/opportunities`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setEnergyData(energyRes.data);
      setOpportunities(oppRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching energy data:", err);
      setError("Failed to load energy intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'HIGH': return <span className="badge bg-success">HIGH CONFIDENCE</span>;
      case 'MEDIUM': return <span className="badge bg-warning text-dark">MED CONFIDENCE</span>;
      case 'LOW': return <span className="badge bg-secondary">LOW CONFIDENCE</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="fade-in d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error || !energyData || energyData.message) {
    return (
      <div className="fade-in page-content">
        <div className="card card-warning d-flex align-items-center gap-3 text-warning">
          <AlertTriangle size={24} />
          <p className="m-0">{error || energyData?.message || "Data not available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in energy-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-1">Energy Intelligence</h1>
          <p className="page-subtitle">Factory-wide power consumption, financial impact, and baseline anomalies.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchData}>
          <Search size={18} /> Rescan Baselines
        </button>
      </div>

      <div className="row g-4 mb-4">
        {/* Total Energy */}
        <div className="col-md-4">
          <div className="card card-energy d-flex flex-row align-items-center gap-3 h-100">
            <div className="p-3 bg-primary text-white rounded-circle">
              <Zap size={32} />
            </div>
            <div>
              <h3 className="fs-6 text-muted mb-1">Total Energy Consumed</h3>
              <div className="fs-3 fw-bold text-white">
                {parseFloat(energyData.totalEnergyKwH).toLocaleString()} <span className="fs-6 text-muted">kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Impact */}
        <div className="col-md-4">
          <div className="card card-secondary d-flex flex-row align-items-center gap-3 h-100">
            <div className="p-3 bg-success text-white rounded-circle">
              <DollarSign size={32} />
            </div>
            <div>
              <h3 className="fs-6 text-muted mb-1">Estimated Cost</h3>
              <div className="fs-3 fw-bold text-white">
                ${parseFloat(energyData.totalCostUSD).toLocaleString()} <span className="fs-6 text-muted">USD</span>
              </div>
              <p className="small text-muted m-0">Calculated at ${energyData.tariffApplied} / kWh</p>
            </div>
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="col-md-4">
          <div className="card card-primary d-flex flex-row align-items-center gap-3 h-100">
            <div className="p-3 bg-info text-white rounded-circle">
              <CloudRain size={32} />
            </div>
            <div>
              <h3 className="fs-6 text-muted mb-1">Carbon Footprint (Scope 2)</h3>
              <div className="fs-3 fw-bold text-white">
                {parseFloat(energyData.totalCO2EmissionsKg).toLocaleString()} <span className="fs-6 text-muted">kg</span>
              </div>
              <p className="small text-muted m-0">{energyData.co2FactorApplied} kg CO₂ / kWh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Opportunity Engine */}
      <h4 className="mb-3 d-flex align-items-center mt-5"><Lightbulb className="me-2 text-warning" /> Energy Opportunity Engine</h4>
      <p className="text-muted mb-4">Actionable anomalies detected against expected consumption baselines.</p>

      {opportunities.length === 0 ? (
        <div className="card text-center py-5">
          <p className="text-muted m-0">No significant energy anomalies detected.</p>
        </div>
      ) : (
        <div className="row g-4">
          {opportunities.map((opp) => (
            <div key={opp._id} className="col-lg-6">
              <div className="card hover-lift h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="text-white mb-1">{opp.title}</h5>
                    <div className="text-muted small d-flex align-items-center">
                      <span className="badge bg-dark border me-2">{opp.type.replace('_', ' ')}</span>
                      {opp.machineId?.name} ({opp.machineId?.currentStatus})
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fs-5 fw-bold text-success">+${opp.estimatedCostSavings.toLocaleString()}</div>
                    <div className="text-muted small">Potential Savings</div>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 bg-dark rounded border border-secondary text-center">
                      <div className="text-muted small">Baseline vs Actual</div>
                      <div className="fw-semibold text-white">
                        {opp.baselineKwh.toFixed(0)} <span className="text-muted">→</span> <span className="text-danger">{opp.actualKwh.toFixed(0)}</span> kWh
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-dark rounded border border-secondary text-center">
                      <div className="text-muted small">Deviation</div>
                      <div className="fw-bold text-warning d-flex align-items-center justify-content-center">
                        <TrendingUp size={14} className="me-1" /> {opp.deviationPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="small text-muted text-uppercase fw-bold mb-2">AI Evidence</h6>
                  <ul className="list-unstyled mb-0">
                    {opp.evidence.map((ev, i) => (
                      <li key={i} className="text-muted small mb-1"><span className="text-primary me-2">•</span>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto border-top border-secondary pt-3 d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small mb-1">Recommendation</div>
                    <div className="text-white small fw-semibold">{opp.recommendation}</div>
                  </div>
                  <div>
                    {getConfidenceBadge(opp.confidence)}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
