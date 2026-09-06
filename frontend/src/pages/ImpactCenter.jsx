import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Zap, Factory, TrendingDown, Clock, Search, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const ImpactCenter = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImpact, setSelectedImpact] = useState(null);

  useEffect(() => {
    fetchTopRisks();
  }, []);

  const fetchTopRisks = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/impacts/top-risks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRisks(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching top risks:', error);
      toast.error('Failed to load impact center data');
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <span className="badge bg-danger ms-2">CRITICAL</span>;
      case 'HIGH': return <span className="badge bg-warning text-dark ms-2">HIGH</span>;
      case 'MEDIUM': return <span className="badge bg-info text-dark ms-2">MEDIUM</span>;
      default: return <span className="badge bg-secondary ms-2">LOW</span>;
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-1">Impact Center</h1>
          <p className="page-subtitle">Cross-domain operational intelligence and risk prioritization.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchTopRisks}>
          <Search size={18} /> Rescan Impact Engine
        </button>
      </div>

      <div className="row g-4">
        {/* Top Risks List */}
        <div className="col-lg-7">
          <h4 className="mb-3 d-flex align-items-center"><ShieldAlert className="me-2 text-danger" /> Top Operational Risks</h4>
          
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : risks.length === 0 ? (
            <div className="card text-center py-5">
              <p className="text-muted">No high-priority impacts detected.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {risks.map((impact, idx) => (
                <div 
                  key={impact._id} 
                  className={`card hover-lift cursor-pointer ${selectedImpact?._id === impact._id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedImpact(impact)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1 text-white">
                        #{idx + 1} {impact.machineId?.name || 'Unknown Asset'}
                        {getSeverityBadge(impact.severity)}
                      </h5>
                      <p className="mb-2 text-muted small">{impact.eventType.replace('_', ' ')} • {impact.status}</p>
                    </div>
                    <div className="text-end">
                      <div className="text-danger fw-bold fs-5">-${impact.estimatedCostImpact.toLocaleString()}</div>
                      <div className="text-muted small">Estimated Cost Impact</div>
                    </div>
                  </div>
                  
                  <div className="row mt-3 pt-3 border-top border-secondary">
                    <div className="col-4">
                      <div className="d-flex align-items-center text-muted small mb-1"><TrendingDown size={14} className="me-1"/> Failure Prob.</div>
                      <div className="fw-semibold text-white">{(impact.failureProbability * 100).toFixed(1)}%</div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex align-items-center text-muted small mb-1"><Zap size={14} className="me-1"/> Energy Impact</div>
                      <div className="fw-semibold text-warning">+{impact.energyDeviationPercent}%</div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex align-items-center text-muted small mb-1"><Clock size={14} className="me-1"/> Downtime Risk</div>
                      <div className="fw-semibold text-white">{impact.estimatedDowntimeHours} hrs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Details Panel */}
        <div className="col-lg-5">
          <h4 className="mb-3 d-flex align-items-center"><Factory className="me-2 text-info" /> Deep Analysis</h4>
          {selectedImpact ? (
            <div className="card card-ai p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h5 className="text-white m-0">Impact: {selectedImpact.impactId}</h5>
                <span className="badge badge-ai">Model V4.0</span>
              </div>

              <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold">Cross-Domain Consequences</h6>
                <table className="table table-dark table-sm mt-2">
                  <tbody>
                    <tr>
                      <td className="text-muted">Production Loss</td>
                      <td className="text-end fw-semibold text-danger">{selectedImpact.estimatedProductionLossUnits} units</td>
                      <td className="text-end"><span className="badge bg-dark border">{selectedImpact.classification?.productionImpact || 'ESTIMATED'}</span></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Energy Excess</td>
                      <td className="text-end fw-semibold text-warning">{selectedImpact.estimatedExcessEnergyKwh.toFixed(1)} kWh</td>
                      <td className="text-end"><span className="badge bg-dark border">{selectedImpact.classification?.energyImpact || 'ESTIMATED'}</span></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Carbon Scope 2</td>
                      <td className="text-end fw-semibold text-info">{selectedImpact.estimatedCarbonImpactTCO2e.toFixed(2)} tCO₂e</td>
                      <td className="text-end"><span className="badge bg-dark border">{selectedImpact.classification?.carbonImpact || 'ESTIMATED'}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold">Evidence Base</h6>
                <ul className="list-unstyled mt-2">
                  {selectedImpact.evidence.map((item, i) => (
                    <li key={i} className="mb-2 text-white small d-flex"><span className="text-primary me-2">→</span> {item}</li>
                  ))}
                  {selectedImpact.evidence.length === 0 && <li className="text-muted small">No evidence logged.</li>}
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold">Assumptions</h6>
                <ul className="list-unstyled mt-2">
                  {selectedImpact.assumptions.map((item, i) => (
                    <li key={i} className="mb-2 text-muted small d-flex"><span className="text-secondary me-2">ℹ</span> {item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-4 border-top border-secondary">
                <h6 className="text-muted text-uppercase small fw-bold mb-3">AI Recommendation</h6>
                <div className="p-3 bg-dark rounded border border-info">
                  <div className="d-flex align-items-center mb-2">
                    <Zap className="text-info me-2" size={18} />
                    <span className="text-white fw-semibold">{selectedImpact.recommendation?.type?.replace('_', ' ')}</span>
                  </div>
                  <button className="btn btn-outline-info btn-sm w-100 mt-2">Execute Authorized Workflow <ExternalLink size={14} className="ms-1"/></button>
                </div>
              </div>

            </div>
          ) : (
            <div className="card text-center py-5 d-flex flex-column align-items-center justify-content-center h-100" style={{ minHeight: '400px' }}>
              <Search className="text-muted mb-3" size={48} />
              <p className="text-muted">Select an impact record from the list to view deep cross-domain analysis, evidence, and recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactCenter;
