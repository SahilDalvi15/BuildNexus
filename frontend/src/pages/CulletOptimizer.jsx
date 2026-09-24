import React, { useState } from 'react';
import axios from 'axios';
import { Target, Zap, DollarSign, Leaf, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CulletOptimizer() {
  const [currentCullet, setCurrentCullet] = useState(20);
  const [targetCullet, setTargetCullet] = useState(30);
  const [dailyProduction, setDailyProduction] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/materials/cullet-optimizer`, {
        currentCulletPercent: currentCullet,
        targetCulletPercent: targetCullet,
        dailyProductionTons: dailyProduction
      }, { headers });
      setResult(res.data.data);
      toast.success('Simulation complete');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in pb-5">
      <div className="mb-4">
        <h1 className="page-title mb-1 d-flex align-items-center gap-2">
          <Target size={28} className="text-primary" />
          Saint-Gobain Cullet Optimizer
        </h1>
        <p className="page-subtitle">Simulate the energy, carbon, cost, and quality impact of modifying the glass cullet ratio in continuous furnaces.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100 border-start border-4 border-primary">
            <h5 className="mb-4">Simulation Parameters</h5>
            
            <div className="mb-4">
              <label className="form-label text-muted d-flex justify-content-between">
                <span>Current Cullet Ratio</span>
                <span className="fw-bold text-white">{currentCullet}%</span>
              </label>
              <input 
                type="range" className="form-range" 
                min="0" max="100" step="1" 
                value={currentCullet} onChange={(e) => setCurrentCullet(Number(e.target.value))} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-muted d-flex justify-content-between">
                <span>Target Cullet Ratio</span>
                <span className="fw-bold text-info">{targetCullet}%</span>
              </label>
              <input 
                type="range" className="form-range" 
                min="0" max="100" step="1" 
                value={targetCullet} onChange={(e) => setTargetCullet(Number(e.target.value))} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-muted">Daily Production (Tons)</label>
              <input 
                type="number" className="form-control bg-dark text-white border-secondary" 
                value={dailyProduction} onChange={(e) => setDailyProduction(Number(e.target.value))} 
              />
            </div>

            <button 
              className="btn btn-primary w-100 py-2 fw-bold" 
              onClick={runSimulation} 
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <TrendingDown size={18} className="me-2" />}
              Run Optimization
            </button>
          </div>
        </div>

        <div className="col-lg-8">
          {result ? (
            <div className="fade-in">
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card bg-dark border border-success h-100 hover-lift">
                    <div className="d-flex align-items-center mb-2">
                      <Zap size={20} className="text-warning me-2" />
                      <h6 className="m-0 text-white">Daily Energy Savings</h6>
                    </div>
                    <h3 className="text-success m-0">{result.impact.energySavedKwhDaily.toLocaleString()} <span className="fs-6 text-muted">kWh</span></h3>
                    <div className="mt-2 text-success small">+${result.impact.energyCostSavingsDailyUSD.toLocaleString()} cost reduction</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-dark border border-info h-100 hover-lift">
                    <div className="d-flex align-items-center mb-2">
                      <Leaf size={20} className="text-success me-2" />
                      <h6 className="m-0 text-white">Daily Carbon Reduction</h6>
                    </div>
                    <h3 className="text-info m-0">{result.impact.carbonSavedKgCO2eDaily.toLocaleString()} <span className="fs-6 text-muted">kg CO₂e</span></h3>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-dark border border-primary h-100 hover-lift">
                    <div className="d-flex align-items-center mb-2">
                      <DollarSign size={20} className="text-success me-2" />
                      <h6 className="m-0 text-white">Material Cost Savings</h6>
                    </div>
                    <h3 className="text-primary m-0">${result.impact.materialCostSavingsDailyUSD.toLocaleString()} <span className="fs-6 text-muted">/ day</span></h3>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={`card bg-dark border h-100 hover-lift ${result.impact.qualityRisk.level === 'HIGH' ? 'border-danger' : result.impact.qualityRisk.level === 'MEDIUM' ? 'border-warning' : 'border-secondary'}`}>
                    <div className="d-flex align-items-center mb-2">
                      <AlertTriangle size={20} className={result.impact.qualityRisk.level === 'HIGH' ? 'text-danger me-2' : result.impact.qualityRisk.level === 'MEDIUM' ? 'text-warning me-2' : 'text-secondary me-2'} />
                      <h6 className="m-0 text-white">Defect Risk Profile</h6>
                    </div>
                    <h3 className={result.impact.qualityRisk.level === 'HIGH' ? 'text-danger m-0' : result.impact.qualityRisk.level === 'MEDIUM' ? 'text-warning m-0' : 'text-white m-0'}>
                      {result.impact.qualityRisk.defectProbabilityPercent}% <span className="fs-6 text-muted">Probability</span>
                    </h3>
                    <div className="mt-2 text-muted small">{result.impact.qualityRisk.warning}</div>
                  </div>
                </div>
              </div>

              <div className="card border-0" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))' }}>
                <h5 className="mb-3">Annualized Impact (Projected)</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-muted mb-1">Total Financial Savings</div>
                    <div className="fs-2 fw-bold text-success">${result.annualized.savingsUSD.toLocaleString()}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted mb-1">Total Carbon Reduction</div>
                    <div className="fs-2 fw-bold text-info">{result.annualized.carbonReducedTons.toLocaleString()} Tons CO₂e</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-100 d-flex align-items-center justify-content-center border-dashed" style={{ borderStyle: 'dashed', borderColor: 'var(--bs-secondary)', backgroundColor: 'transparent' }}>
              <div className="text-center p-5">
                <Target size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-muted">No Simulation Run</h5>
                <p className="text-secondary mb-0">Adjust the parameters on the left and click "Run Optimization" to see the projected impact for your continuous furnace.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
