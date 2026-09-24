import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Zap, Leaf, DollarSign, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifiedImpact() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_URL}/recommendations`, { headers });
      setRecommendations(res.data.data);
    } catch (err) {
      toast.error('Failed to load verified impact data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.patch(`${API_URL}/recommendations/${id}/status`, { status }, { headers });
      toast.success(`Moved to ${status}`);
      fetchRecs();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const calculateFunnel = () => {
    let estimated = 0;
    let approved = 0;
    let verified = 0;

    recommendations.forEach(r => {
      const val = r.predictedImpact?.costSavedUSD || 0;
      estimated += val;
      if (['APPROVED', 'EXECUTED', 'VERIFIED'].includes(r.status)) {
        approved += val;
      }
      if (r.status === 'VERIFIED' && r.verificationId) {
        // Use verified savings if available
        verified += r.verificationId.verifiedSavings?.costUSD || 0;
      }
    });

    return { estimated, approved, verified };
  };

  const funnel = calculateFunnel();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'RECOMMENDED': return <span className="badge bg-secondary">Detected</span>;
      case 'APPROVED': return <span className="badge bg-primary">Approved</span>;
      case 'EXECUTED': return <span className="badge bg-warning text-dark">Executed (Measuring)</span>;
      case 'VERIFIED': return <span className="badge bg-success"><ShieldCheck size={12} className="me-1"/> Verified</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="fade-in pb-5">
      <div className="mb-4">
        <h1 className="page-title mb-1 d-flex align-items-center gap-2">
          <ShieldCheck size={28} className="text-success" />
          Closed-Loop Verified Impact
        </h1>
        <p className="page-subtitle">Track the entire lifecycle from AI-Detected Opportunity → Human Approval → Execution → Cryptographically Verified ROI.</p>
      </div>

      <div className="row mb-5 g-3">
        <div className="col-md-4">
          <div className="card bg-dark border-secondary h-100">
            <div className="card-body text-center">
              <h6 className="text-muted text-uppercase mb-3">1. Identified Opportunities</h6>
              <h2 className="text-white">${funnel.estimated.toLocaleString()}</h2>
              <div className="text-muted small mt-2">Total AI-Predicted Annual Savings</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark border-primary h-100 position-relative">
            <ArrowRight className="position-absolute text-muted" style={{left: '-15px', top: '40%', zIndex: 10}} size={30} />
            <div className="card-body text-center">
              <h6 className="text-muted text-uppercase mb-3">2. Approved & Executed</h6>
              <h2 className="text-primary">${funnel.approved.toLocaleString()}</h2>
              <div className="text-muted small mt-2">Human-Approved Initiatives</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success bg-opacity-10 border-success h-100 position-relative hover-lift">
            <ArrowRight className="position-absolute text-muted" style={{left: '-15px', top: '40%', zIndex: 10}} size={30} />
            <div className="card-body text-center">
              <h6 className="text-success text-uppercase mb-3"><ShieldCheck size={16} className="me-1 mb-1"/> 3. Verified Impact</h6>
              <h2 className="text-success fw-bold">${funnel.verified.toLocaleString()}</h2>
              <div className="text-muted small mt-2">Normalized & Measured Realized ROI</div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Opportunity Lifecycle Tracker</h5>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
      ) : (
        <div className="row g-4">
          {recommendations.map(rec => (
            <div key={rec._id} className={`col-12`}>
              <div className={`card bg-dark border ${rec.status === 'VERIFIED' ? 'border-success' : 'border-secondary'}`}>
                <div className="card-header border-bottom border-secondary d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex align-items-center gap-3">
                    {getStatusBadge(rec.status)}
                    <h6 className="m-0 text-white fw-bold">{rec.title}</h6>
                    <span className="text-muted small px-2 border-start border-secondary">{rec.recommendationId}</span>
                  </div>
                  <div>
                    {rec.status === 'RECOMMENDED' && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => updateStatus(rec._id, 'APPROVED')}>Approve Initiative</button>
                    )}
                    {rec.status === 'APPROVED' && (
                      <button className="btn btn-sm btn-primary" onClick={() => updateStatus(rec._id, 'EXECUTED')}>Mark Executed</button>
                    )}
                    {rec.status === 'EXECUTED' && (
                      <button className="btn btn-sm btn-warning text-dark" disabled>Measuring Baseline vs Target...</button>
                    )}
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-5">
                      <h6 className="text-muted mb-2">The Problem (Detected)</h6>
                      <p className="text-white small mb-3">{rec.problem}</p>
                      
                      <h6 className="text-muted mb-2">Evidence & Context</h6>
                      <p className="text-info small mb-3"><Activity size={14} className="me-1"/> {rec.evidence}</p>

                      <h6 className="text-muted mb-2">Recommended Action</h6>
                      <p className="text-white small m-0">{rec.recommendedAction}</p>
                    </div>
                    
                    <div className="col-md-3 border-start border-secondary">
                      <h6 className="text-muted mb-3">AI Estimated Impact</h6>
                      <div className="d-flex align-items-center mb-2">
                        <DollarSign size={16} className="text-success me-2" />
                        <span className="text-white">${rec.predictedImpact?.costSavedUSD?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <Zap size={16} className="text-warning me-2" />
                        <span className="text-white">{rec.predictedImpact?.energySavedKwh?.toLocaleString()} kWh</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <Leaf size={16} className="text-info me-2" />
                        <span className="text-white">{rec.predictedImpact?.carbonSavedKg?.toLocaleString()} kg CO₂e</span>
                      </div>
                    </div>

                    <div className="col-md-4 border-start border-secondary position-relative">
                      {rec.status === 'VERIFIED' && rec.verificationId ? (
                        <div className="bg-success bg-opacity-10 rounded p-3 h-100 border border-success">
                          <h6 className="text-success d-flex align-items-center mb-3">
                            <ShieldCheck size={18} className="me-2" />
                            Final Verified Impact
                          </h6>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Measured Savings:</span>
                            <span className="text-white fw-bold">${rec.verificationId.measuredSavings?.costUSD?.toLocaleString()}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-3 pb-3 border-bottom border-success">
                            <span className="text-muted small">Production Normalized:</span>
                            <span className="text-success fw-bold">${rec.verificationId.verifiedSavings?.costUSD?.toLocaleString()}</span>
                          </div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>
                            <strong>Verification Note:</strong> {rec.verificationId.normalizationFactors?.[0] || 'Confirmed by telemetry.'}
                          </div>
                        </div>
                      ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-50">
                          <ShieldCheck size={40} className="text-secondary mb-2" />
                          <span className="text-muted small">Verification will appear here after measurement period completes.</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {recommendations.length === 0 && (
             <div className="text-center p-5 border border-dashed border-secondary rounded">
               <AlertCircle size={48} className="text-secondary mb-3 opacity-50" />
               <h5 className="text-muted">No Opportunities Logged</h5>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
