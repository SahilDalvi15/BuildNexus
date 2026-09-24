import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Target, TrendingDown, CheckCircle, Clock, Zap, Factory } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Decarbonization() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`${API_URL}/decarbonization`, { headers });
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load Decarbonization Roadmap');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  if (!data) return <div className="text-center py-5">No roadmap data available.</div>;

  const { roadmap, initiatives } = data;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle size={16} className="text-success" />;
      case 'COMPLETED': return <CheckCircle size={16} className="text-primary" />;
      case 'IN_PROGRESS': return <Clock size={16} className="text-warning" />;
      case 'APPROVED': return <Zap size={16} className="text-info" />;
      default: return <Clock size={16} className="text-secondary" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'VERIFIED': return 'bg-success';
      case 'COMPLETED': return 'bg-primary';
      case 'IN_PROGRESS': return 'bg-warning text-dark';
      case 'APPROVED': return 'bg-info text-dark';
      case 'EVALUATING': return 'bg-secondary';
      default: return 'bg-dark border border-secondary';
    }
  };

  const calculateProgress = () => {
    const totalReductionNeeded = roadmap.baselineEmissionsTons - roadmap.targetEmissionsTons;
    const currentReduction = roadmap.totalVerifiedReduction;
    const progressPercent = (currentReduction / totalReductionNeeded) * 100;
    return Math.min(Math.max(progressPercent, 0), 100);
  };

  const progress = calculateProgress();

  return (
    <div className="fade-in pb-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title mb-1 d-flex align-items-center gap-2">
            <Target size={28} className="text-success" />
            Decarbonization Roadmap
          </h1>
          <p className="page-subtitle">Strategic planning, execution tracking, and verified impact of multi-year decarbonization initiatives.</p>
        </div>
      </div>

      <div className="card bg-dark border-secondary mb-5 p-4">
        <h5 className="mb-4 text-white">Net-Zero Pathway to {roadmap.targetYear}</h5>
        
        <div className="row text-center mb-4 g-3">
          <div className="col-md-3">
            <div className="text-muted small text-uppercase">Baseline</div>
            <div className="fs-3 fw-bold text-white">{roadmap.baselineEmissionsTons.toLocaleString()} <span className="fs-6 text-muted">Tons</span></div>
          </div>
          <div className="col-md-3 border-start border-secondary">
            <div className="text-muted small text-uppercase">Current (Verified)</div>
            <div className="fs-3 fw-bold text-success">{roadmap.currentEmissionsTons.toLocaleString()} <span className="fs-6 text-muted">Tons</span></div>
          </div>
          <div className="col-md-3 border-start border-secondary">
            <div className="text-muted small text-uppercase">Total Planned Reductions</div>
            <div className="fs-3 fw-bold text-info">{(roadmap.totalEstimatedReduction + roadmap.totalVerifiedReduction).toLocaleString()} <span className="fs-6 text-muted">Tons</span></div>
          </div>
          <div className="col-md-3 border-start border-secondary">
            <div className="text-muted small text-uppercase">2030 Target</div>
            <div className="fs-3 fw-bold text-primary">{roadmap.targetEmissionsTons.toLocaleString()} <span className="fs-6 text-muted">Tons</span></div>
          </div>
        </div>

        <div className="progress mb-2" style={{ height: '30px', backgroundColor: 'var(--bs-gray-800)', borderRadius: '15px' }}>
          <div 
            className="progress-bar bg-success fw-bold" 
            role="progressbar" 
            style={{ width: `${progress}%` }}
          >
            {progress.toFixed(1)}% Verified Progress
          </div>
          <div 
            className="progress-bar bg-info bg-opacity-50 progress-bar-striped" 
            role="progressbar" 
            style={{ width: `${(roadmap.totalEstimatedReduction / (roadmap.baselineEmissionsTons - roadmap.targetEmissionsTons)) * 100}%` }}
          >
            Planned
          </div>
        </div>
        <div className="d-flex justify-content-between text-muted small mt-1 px-2">
          <span>Baseline</span>
          <span className="text-warning">Gap to Target: {roadmap.gapToTargetTons.toLocaleString()} Tons</span>
          <span>Target Achieved</span>
        </div>
      </div>

      <h5 className="mb-4">Strategic Initiatives</h5>
      
      <div className="row g-4">
        {initiatives.map(initiative => (
          <div key={initiative._id} className="col-lg-6">
            <div className={`card h-100 bg-dark border ${initiative.status === 'VERIFIED' ? 'border-success' : 'border-secondary'} hover-lift`}>
              <div className="card-header border-bottom border-secondary d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center gap-2">
                  <Factory size={18} className="text-muted" />
                  <span className={`badge ${getStatusBadgeClass(initiative.status)}`}>
                    {initiative.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-muted small font-monospace">
                  {initiative.initiativeId}
                </div>
              </div>
              
              <div className="card-body">
                <h5 className="text-white mb-2">{initiative.title}</h5>
                <p className="text-muted small mb-4" style={{ minHeight: '40px' }}>{initiative.description}</p>
                
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="bg-black bg-opacity-25 rounded p-2 text-center h-100 border border-secondary">
                      <div className="text-muted" style={{fontSize: '0.7rem', textTransform: 'uppercase'}}>Proposed Capex</div>
                      <div className="text-white fw-bold">${(initiative.financials.estimatedCapexUSD / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-black bg-opacity-25 rounded p-2 text-center h-100 border border-secondary">
                      <div className="text-muted" style={{fontSize: '0.7rem', textTransform: 'uppercase'}}>Target Date</div>
                      <div className="text-info fw-bold">{initiative.timeline.targetCompletionYear}</div>
                    </div>
                  </div>
                </div>

                <div className={`rounded p-3 border ${initiative.status === 'VERIFIED' ? 'bg-success bg-opacity-10 border-success' : 'bg-black bg-opacity-50 border-secondary'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">Target Carbon Reduction</span>
                    <span className="text-white fw-bold">{initiative.carbonImpact.estimatedAnnualReductionTons.toLocaleString()} Tons</span>
                  </div>
                  {initiative.status === 'VERIFIED' && (
                    <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top border-success">
                      <span className="text-success small fw-bold d-flex align-items-center gap-1">
                        <CheckCircle size={14} /> Verified Actuals
                      </span>
                      <span className="text-success fw-bold">{initiative.carbonImpact.verifiedAnnualReductionTons.toLocaleString()} Tons</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
