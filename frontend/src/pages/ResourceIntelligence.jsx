import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Recycle, Droplets, Package, AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ResourceIntelligence() {
  const [waste, setWaste] = useState(null);
  const [wasteOpps, setWasteOpps] = useState([]);
  const [materials, setMaterials] = useState(null);
  const [matOptimization, setMatOptimization] = useState([]);
  const [water, setWater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('waste');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const [wasteRes, wasteOppRes, matRes, matOptRes, waterRes] = await Promise.all([
        axios.get(`${API_URL}/waste/streams`, { headers }),
        axios.get(`${API_URL}/waste/opportunities`, { headers }),
        axios.get(`${API_URL}/materials/batches`, { headers }),
        axios.get(`${API_URL}/materials/optimization`, { headers }),
        axios.get(`${API_URL}/water/summary`, { headers })
      ]);
      setWaste(wasteRes.data);
      setWasteOpps(wasteOppRes.data.data || []);
      setMaterials(matRes.data);
      setMatOptimization(matOptRes.data.data || []);
      setWater(waterRes.data);
    } catch (err) {
      console.error('Error fetching resource data:', err);
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

  const tabs = [
    { key: 'waste', label: 'Waste Intelligence', icon: <Trash2 size={16} /> },
    { key: 'material', label: 'Material Intelligence', icon: <Package size={16} /> },
    { key: 'water', label: 'Water Intelligence', icon: <Droplets size={16} /> }
  ];

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="page-title mb-1">Resource Intelligence</h1>
        <p className="page-subtitle">Waste streams, material yield, and water consumption tracking.</p>
      </div>

      {/* Tab Navigation */}
      <div className="d-flex gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} <span className="ms-1">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ========== WASTE TAB ========== */}
      {activeTab === 'waste' && (
        <>
          {/* Summary Cards */}
          {waste?.summary && (
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card h-100">
                  <h6 className="text-muted mb-1">Total Waste</h6>
                  <div className="fs-3 fw-bold text-white">{waste.summary.totalWasteKg.toLocaleString()} <span className="fs-6 text-muted">kg</span></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100">
                  <h6 className="text-muted mb-1">Recoverable</h6>
                  <div className="fs-3 fw-bold text-success">{waste.summary.recoverableKg.toLocaleString()} <span className="fs-6 text-muted">kg</span></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100">
                  <h6 className="text-muted mb-1">Disposal</h6>
                  <div className="fs-3 fw-bold text-danger">{waste.summary.disposalKg.toLocaleString()} <span className="fs-6 text-muted">kg</span></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100">
                  <h6 className="text-muted mb-1">Recovery Rate</h6>
                  <div className="fs-3 fw-bold text-info">{waste.summary.recoveryRate}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Waste Streams Table */}
          <div className="card mb-4">
            <h5 className="mb-3">Active Waste Streams</h5>
            {waste?.data?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                  <thead><tr><th>ID</th><th>Material</th><th>Source</th><th>Qty (kg)</th><th>Type</th><th>Method</th><th>CO₂ Impact</th></tr></thead>
                  <tbody>
                    {waste.data.map(s => (
                      <tr key={s._id}>
                        <td className="fw-semibold">{s.streamId}</td>
                        <td>{s.materialType}</td>
                        <td>{s.sourceProcess}</td>
                        <td className="fw-bold">{s.quantity}</td>
                        <td><span className={`badge ${s.recoverability === 'RECOVERABLE' ? 'bg-success' : 'bg-danger'}`}>{s.recoverability}</span></td>
                        <td>{s.disposalMethod || '—'}</td>
                        <td>{s.estimatedCarbonImpactKg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-muted">No waste streams tracked.</p>}
          </div>

          {/* Waste-to-Value Opportunities */}
          <h5 className="mb-3 d-flex align-items-center"><Recycle className="me-2 text-success" /> Waste-to-Value Opportunities</h5>
          {wasteOpps.length > 0 ? (
            <div className="row g-4">
              {wasteOpps.map((opp, i) => (
                <div key={i} className="col-lg-6">
                  <div className="card hover-lift h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="text-white mb-1">{opp.materialType}</h5>
                        <span className="text-muted small">Source: {opp.sourceProcess}</span>
                      </div>
                      <span className={`badge ${opp.confidence === 'HIGH' ? 'bg-success' : opp.confidence === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{opp.confidence}</span>
                    </div>
                    <div className="row g-2 mt-2">
                      <div className="col-4"><div className="p-2 bg-dark rounded border border-secondary text-center"><div className="text-muted small">Recoverable</div><div className="fw-bold text-success">{opp.recoverableKg} kg</div></div></div>
                      <div className="col-4"><div className="p-2 bg-dark rounded border border-secondary text-center"><div className="text-muted small">Savings</div><div className="fw-bold text-info">${opp.potentialMaterialSavingsUSD}</div></div></div>
                      <div className="col-4"><div className="p-2 bg-dark rounded border border-secondary text-center"><div className="text-muted small">CO₂ Avoided</div><div className="fw-bold text-warning">{opp.potentialCO2ReductionKg} kg</div></div></div>
                    </div>
                    <div className="mt-3 text-muted small">Pathways: {opp.pathways.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="card text-center py-4"><p className="text-muted m-0">No recovery opportunities detected.</p></div>}
        </>
      )}

      {/* ========== MATERIAL TAB ========== */}
      {activeTab === 'material' && (
        <>
          {materials?.summary && (
            <div className="row g-4 mb-4">
              <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Avg Virgin Material</h6><div className="fs-3 fw-bold text-warning">{materials.summary.avgVirginPercent}%</div></div></div>
              <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Avg Recycled Content</h6><div className="fs-3 fw-bold text-success">{materials.summary.avgRecycledPercent}%</div></div></div>
              <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Avg Material Yield</h6><div className="fs-3 fw-bold text-info">{materials.summary.avgYield}%</div></div></div>
              <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Avg Scrap Rate</h6><div className="fs-3 fw-bold text-danger">{materials.summary.avgScrapPercent}%</div></div></div>
            </div>
          )}

          {/* Batch Table */}
          <div className="card mb-4">
            <h5 className="mb-3">Recent Material Batches</h5>
            {materials?.data?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                  <thead><tr><th>Batch</th><th>Product</th><th>Virgin</th><th>Recycled</th><th>Yield</th><th>Scrap</th><th>Scrap (kg)</th></tr></thead>
                  <tbody>
                    {materials.data.map(b => (
                      <tr key={b._id}>
                        <td className="fw-semibold">{b.batchId}</td>
                        <td>{b.productName}</td>
                        <td>{b.virginMaterialPercent}%</td>
                        <td className="text-success">{b.recycledMaterialPercent}%</td>
                        <td>{b.materialYield}%</td>
                        <td className={b.scrapPercent > 8 ? 'text-danger fw-bold' : ''}>{b.scrapPercent}%</td>
                        <td>{b.scrapKg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-muted">No material batches tracked.</p>}
          </div>

          {/* Optimization Opportunities */}
          <h5 className="mb-3 d-flex align-items-center"><Lightbulb className="me-2 text-warning" /> Material Optimization Opportunities</h5>
          {matOptimization.length > 0 ? (
            <div className="row g-3">
              {matOptimization.map((opp, i) => (
                <div key={i} className="col-lg-6">
                  <div className="card hover-lift h-100">
                    <h5 className="text-white mb-1">{opp.batchId} — {opp.productName}</h5>
                    {opp.issues.map((issue, j) => (
                      <div key={j} className="mt-2 p-2 bg-dark rounded border border-secondary">
                        <span className={`badge me-2 ${issue.type === 'HIGH_SCRAP' ? 'bg-danger' : issue.type === 'LOW_YIELD' ? 'bg-warning text-dark' : 'bg-info'}`}>{issue.type.replace(/_/g, ' ')}</span>
                        <span className="text-muted small">{issue.detail}</span>
                        <div className="text-white small mt-1">{issue.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="card text-center py-4"><p className="text-muted m-0">All batches within acceptable parameters.</p></div>}
        </>
      )}

      {/* ========== WATER TAB ========== */}
      {activeTab === 'water' && (
        <>
          {water?.summary ? (
            <>
              <div className="row g-4 mb-4">
                <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Total Consumption</h6><div className="fs-3 fw-bold text-info">{water.summary.totalConsumptionM3.toLocaleString()} <span className="fs-6 text-muted">m³</span></div></div></div>
                <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Reuse Rate</h6><div className="fs-3 fw-bold text-success">{water.summary.avgReusePercent}%</div></div></div>
                <div className="col-md-3"><div className="card h-100"><h6 className="text-muted mb-1">Water Intensity</h6><div className="fs-3 fw-bold text-white">{water.summary.avgWaterIntensity} <span className="fs-6 text-muted">m³/unit</span></div></div></div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <h6 className="text-muted mb-1">Leakage Alerts</h6>
                    <div className={`fs-3 fw-bold ${water.summary.leakageAlerts > 0 ? 'text-danger' : 'text-success'}`}>
                      {water.summary.leakageAlerts > 0 ? <><AlertTriangle size={20} className="me-2" />{water.summary.leakageAlerts}</> : '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Breakdown */}
              <div className="card">
                <h5 className="mb-3">Water Consumption Breakdown</h5>
                <div className="row g-3">
                  {[
                    { label: 'Process', value: water.summary.breakdown.processM3, pct: water.summary.breakdown.processPercent, color: '#3498db' },
                    { label: 'Cooling', value: water.summary.breakdown.coolingM3, pct: water.summary.breakdown.coolingPercent, color: '#1abc9c' },
                    { label: 'Cleaning', value: water.summary.breakdown.cleaningM3, pct: water.summary.breakdown.cleaningPercent, color: '#9b59b6' },
                    { label: 'Other', value: water.summary.breakdown.otherM3, pct: water.summary.breakdown.otherPercent, color: '#7f8c8d' }
                  ].map((item, i) => (
                    <div key={i} className="col-md-3">
                      <div className="p-3 bg-dark rounded border border-secondary text-center">
                        <div className="text-muted small mb-1">{item.label}</div>
                        <div className="fw-bold text-white fs-4">{item.value} m³</div>
                        <div className="mt-2" style={{ height: 6, backgroundColor: '#1a1a2e', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${item.pct}%`, backgroundColor: item.color, borderRadius: 3 }} />
                        </div>
                        <div className="text-muted small mt-1">{item.pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-5"><p className="text-muted m-0">No water data available.</p></div>
          )}
        </>
      )}
    </div>
  );
}
