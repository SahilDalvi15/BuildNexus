import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Target, TrendingDown, AlertTriangle, Zap, Leaf, DollarSign, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getColorForValue = (val, baseline = 100, inverted = false) => {
  if (val === baseline) return 'text-muted';
  if (inverted) return val > baseline ? 'text-danger' : 'text-success';
  return val < baseline ? 'text-success' : 'text-danger';
};

export default function Optimizer() {
  const [scenarios, setScenarios] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [targetPercent, setTargetPercent] = useState(20);
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios');

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => { fetchScenarios(); }, []);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/optimizer/scenarios`, { headers });
      setScenarios(res.data.data);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await axios.post(`${API_URL}/optimizer/decarb-roadmap`, { targetReductionPercent: targetPercent }, { headers });
      setRoadmap(res.data.data);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const dimensions = ['production', 'energy', 'carbon', 'cost', 'downtime', 'quality'];
  const dimLabels = { production: 'Production', energy: 'Energy', carbon: 'Carbon', cost: 'Cost', downtime: 'Downtime', quality: 'Quality' };
  const dimIcons = { production: <BarChart3 size={14} />, energy: <Zap size={14} />, carbon: <Leaf size={14} />, cost: <DollarSign size={14} />, downtime: <AlertTriangle size={14} />, quality: <Target size={14} /> };
  // For these dimensions, lower is better
  const lowerIsBetter = ['energy', 'carbon', 'cost', 'downtime'];

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="page-title mb-1">Optimization Engine</h1>
        <p className="page-subtitle">Multi-objective scenario analysis and decarbonization roadmap.</p>
      </div>

      <div className="d-flex gap-2 mb-4">
        <button className={`btn ${activeTab === 'scenarios' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('scenarios')}>
          <BarChart3 size={16} /> <span className="ms-1">Optimization Scenarios</span>
        </button>
        <button className={`btn ${activeTab === 'decarb' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('decarb')}>
          <TrendingDown size={16} /> <span className="ms-1">Decarbonization Roadmap</span>
        </button>
      </div>

      {/* ========== SCENARIOS TAB ========== */}
      {activeTab === 'scenarios' && scenarios && (
        <>
          <div className="card mb-4" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div className="d-flex align-items-center gap-2 text-warning small">
              <AlertTriangle size={16} />
              <strong>PROJECTED</strong> — All scenario values are projections requiring engineering and business validation.
            </div>
          </div>

          {/* Scenario Comparison Table */}
          <div className="card mb-4">
            <h5 className="mb-3">Scenario Comparison</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Scenario</th>
                    {dimensions.map(d => <th key={d} className="text-center">{dimIcons[d]} {dimLabels[d]}</th>)}
                    <th className="text-center">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.scenarios.map((s, i) => (
                    <tr key={s.scenarioId} className={i === 0 ? 'table-active' : ''}>
                      <td className="fw-semibold">{s.name}</td>
                      {dimensions.map(d => {
                        const val = s[d];
                        const isLowerBetter = lowerIsBetter.includes(d);
                        const colorClass = i === 0 ? 'text-muted' : getColorForValue(val, 100, !isLowerBetter);
                        return (
                          <td key={d} className={`text-center fw-bold ${colorClass}`}>
                            {val}%
                          </td>
                        );
                      })}
                      <td className="text-center">
                        <span className={`badge ${s.risk === 'Baseline' ? 'bg-dark border' : s.risk === 'Low' ? 'bg-success' : s.risk === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {s.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario Detail Cards */}
          <div className="row g-4">
            {scenarios.scenarios.filter(s => s.actions && s.actions.length > 0).map(s => (
              <div key={s.scenarioId} className="col-lg-4">
                <div className="card hover-lift h-100">
                  <h5 className="text-white mb-2">{s.name}</h5>
                  <span className={`badge mb-3 ${s.risk === 'Low' ? 'bg-success' : s.risk === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>{s.risk} Risk</span>
                  <div className="mb-3">
                    <h6 className="text-muted small text-uppercase mb-2">Required Actions</h6>
                    <ul className="list-unstyled mb-0">
                      {s.actions.map((a, i) => (
                        <li key={i} className="text-white small mb-2 d-flex">
                          <ChevronRight size={14} className="text-primary me-2 mt-1 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {s.estimatedSavingsUSD && (
                    <div className="mt-auto pt-2 border-top border-secondary">
                      <span className="text-success fw-bold">${s.estimatedSavingsUSD.toLocaleString()}</span>
                      <span className="text-muted small"> estimated savings</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== DECARB TAB ========== */}
      {activeTab === 'decarb' && (
        <>
          <div className="card mb-4">
            <h5 className="mb-3">Set Decarbonization Target</h5>
            <div className="d-flex align-items-center gap-3">
              <label className="text-muted">Target CO₂ Reduction:</label>
              <input
                type="range"
                min="5" max="50" step="5"
                value={targetPercent}
                onChange={(e) => setTargetPercent(Number(e.target.value))}
                className="form-range"
                style={{ maxWidth: 300 }}
              />
              <span className="fs-4 fw-bold text-success">{targetPercent}%</span>
              <button className="btn btn-primary ms-3" onClick={fetchRoadmap} disabled={roadmapLoading}>
                {roadmapLoading ? <span className="spinner-border spinner-border-sm" /> : 'Generate Roadmap'}
              </button>
            </div>
          </div>

          {roadmap && (
            <>
              {/* Summary Banner */}
              <div className="card mb-4" style={{ borderLeft: `4px solid ${roadmap.gapClosed ? 'var(--success)' : 'var(--warning)'}` }}>
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <h6 className="text-muted mb-1">Current Emissions</h6>
                    <div className="fs-4 fw-bold text-white">{roadmap.currentEmissionsTCO2e} <span className="fs-6 text-muted">tCO₂e</span></div>
                  </div>
                  <div className="col-md-3">
                    <h6 className="text-muted mb-1">Target Emissions</h6>
                    <div className="fs-4 fw-bold text-info">{roadmap.targetEmissionsTCO2e} <span className="fs-6 text-muted">tCO₂e</span></div>
                  </div>
                  <div className="col-md-3">
                    <h6 className="text-muted mb-1">Projected Emissions</h6>
                    <div className="fs-4 fw-bold text-success">{roadmap.projectedEmissionsTCO2e} <span className="fs-6 text-muted">tCO₂e</span></div>
                  </div>
                  <div className="col-md-3">
                    <h6 className="text-muted mb-1">Gap</h6>
                    <div className={`fs-4 fw-bold ${roadmap.gapClosed ? 'text-success' : 'text-warning'}`}>
                      {roadmap.gapClosed ? '✓ Target Achievable' : `${roadmap.gapTCO2e} tCO₂e remaining`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Levers */}
              <h5 className="mb-3">Decarbonization Levers</h5>
              <div className="row g-4 mb-4">
                {roadmap.levers.map((lever, i) => (
                  <div key={i} className="col-lg-4">
                    <div className="card hover-lift h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="text-white mb-0">{lever.name}</h5>
                        <span className={`badge ${lever.priority === 'HIGH' ? 'bg-success' : lever.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{lever.priority}</span>
                      </div>
                      <span className="badge bg-dark border mb-3">{lever.category}</span>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="p-2 bg-dark rounded border border-secondary text-center">
                            <div className="text-muted small">CO₂ Reduction</div>
                            <div className="fw-bold text-success">{lever.reductionKg} kg</div>
                            <div className="text-muted small">({lever.reductionPercent}%)</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2 bg-dark rounded border border-secondary text-center">
                            <div className="text-muted small">Payback</div>
                            <div className="fw-bold text-info">{lever.paybackMonths} months</div>
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="text-muted small">Investment</div>
                          <div className="fw-semibold text-warning">${lever.estimatedCostUSD.toLocaleString()}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Annual Savings</div>
                          <div className="fw-semibold text-success">${lever.estimatedSavingsUSD.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <h6 className="small text-muted text-uppercase mb-2">Actions</h6>
                        <ul className="list-unstyled mb-0">
                          {lever.actions.map((a, j) => (
                            <li key={j} className="text-white small mb-1"><span className="text-primary me-1">•</span>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">Total Estimated Investment: </span>
                    <span className="fw-bold text-warning">${roadmap.totalEstimatedCostUSD.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted">Total Annual Savings: </span>
                    <span className="fw-bold text-success">${roadmap.totalEstimatedSavingsUSD.toLocaleString()}</span>
                  </div>
                  <div className="text-muted small fst-italic">{roadmap.classification}</div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
