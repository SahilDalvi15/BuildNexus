import React, { useState } from 'react';
import axios from 'axios';
import { Flame, Zap, DollarSign, Leaf, Wind, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function FurnaceTwin() {
  const [currentGas, setCurrentGas] = useState(100);
  const [targetGas, setTargetGas] = useState(70);
  const [targetHydrogen, setTargetHydrogen] = useState(30);
  const [dailyEnergy, setDailyEnergy] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Auto-adjust hydrogen when gas changes
  const handleTargetGasChange = (val) => {
    setTargetGas(val);
    setTargetHydrogen(100 - val);
  };

  const handleTargetHydrogenChange = (val) => {
    setTargetHydrogen(val);
    setTargetGas(100 - val);
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/digital-twin/furnace-simulator`, {
        currentGasPercent: currentGas,
        targetGasPercent: targetGas,
        targetHydrogenPercent: targetHydrogen,
        dailyEnergyMwh: dailyEnergy
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
          <Flame size={28} className="text-danger" />
          Saint-Gobain Furnace Twin & Fuel Simulator
        </h1>
        <p className="page-subtitle">Simulate the financial and carbon impact of transitioning a continuous glass furnace from 100% Natural Gas to a Green Hydrogen blend.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100 border-start border-4 border-danger">
            <h5 className="mb-4">Simulation Parameters</h5>
            
            <div className="mb-4">
              <label className="form-label text-muted d-flex justify-content-between">
                <span>Current Fuel Mix</span>
                <span className="fw-bold text-white">{currentGas}% Natural Gas</span>
              </label>
              <div className="progress" style={{height: '10px'}}>
                <div className="progress-bar bg-danger" style={{width: `${currentGas}%`}}></div>
                <div className="progress-bar bg-info" style={{width: `${100 - currentGas}%`}}></div>
              </div>
            </div>

            <hr className="border-secondary my-4" />
            
            <h6 className="mb-3 text-white">Target Fuel Mix</h6>
            <div className="mb-3">
              <label className="form-label text-muted d-flex justify-content-between">
                <span>Natural Gas</span>
                <span className="fw-bold text-danger">{targetGas}%</span>
              </label>
              <input 
                type="range" className="form-range" 
                min="0" max="100" step="5" 
                value={targetGas} onChange={(e) => handleTargetGasChange(Number(e.target.value))} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-muted d-flex justify-content-between">
                <span>Green Hydrogen</span>
                <span className="fw-bold text-info">{targetHydrogen}%</span>
              </label>
              <input 
                type="range" className="form-range" 
                min="0" max="100" step="5" 
                value={targetHydrogen} onChange={(e) => handleTargetHydrogenChange(Number(e.target.value))} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-muted">Daily Energy Requirement (MWh)</label>
              <input 
                type="number" className="form-control bg-dark text-white border-secondary" 
                value={dailyEnergy} onChange={(e) => setDailyEnergy(Number(e.target.value))} 
              />
            </div>

            <button 
              className="btn btn-danger w-100 py-2 fw-bold" 
              onClick={runSimulation} 
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <Activity size={18} className="me-2" />}
              Run Fuel Transition Simulation
            </button>
          </div>
        </div>

        <div className="col-lg-8">
          {result ? (
            <div className="fade-in">
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card bg-dark border border-info h-100 hover-lift">
                    <div className="d-flex align-items-center mb-2">
                      <Leaf size={20} className="text-info me-2" />
                      <h6 className="m-0 text-white">Daily Carbon Reduction</h6>
                    </div>
                    <h3 className="text-info m-0">{result.impact.emissionsReducedDailyKg.toLocaleString()} <span className="fs-6 text-muted">kg CO₂e</span></h3>
                    <div className="mt-2 text-info small">{result.impact.carbonReductionPercent}% reduction from baseline</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-dark border border-warning h-100 hover-lift">
                    <div className="d-flex align-items-center mb-2">
                      <DollarSign size={20} className="text-warning me-2" />
                      <h6 className="m-0 text-white">Cost Premium (Daily)</h6>
                    </div>
                    <h3 className="text-warning m-0">+${result.impact.costIncreaseDailyUSD.toLocaleString()}</h3>
                    <div className="mt-2 text-warning small">{result.impact.costPremiumPercent}% increase in operating cost</div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card bg-dark border border-secondary h-100">
                    <div className="text-muted small mb-1">Current Daily OPEX</div>
                    <div className="fs-4 fw-bold text-white">${result.impact.currentDailyCostUSD.toLocaleString()}</div>
                    <div className="text-muted small mt-3 mb-1">Current Daily Emissions</div>
                    <div className="fs-4 fw-bold text-white">{result.impact.currentDailyEmissionsKg.toLocaleString()} kg</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-dark border border-secondary h-100" style={{background: 'rgba(59, 130, 246, 0.05)'}}>
                    <div className="text-muted small mb-1">Target Daily OPEX</div>
                    <div className="fs-4 fw-bold text-danger">${result.impact.targetDailyCostUSD.toLocaleString()}</div>
                    <div className="text-muted small mt-3 mb-1">Target Daily Emissions</div>
                    <div className="fs-4 fw-bold text-info">{result.impact.targetDailyEmissionsKg.toLocaleString()} kg</div>
                  </div>
                </div>
              </div>

              <div className="card border-0" style={{ background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(245, 158, 11, 0.1))' }}>
                <h5 className="mb-3">Annualized Impact (350 Operating Days)</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-muted mb-1">Total Carbon Avoided</div>
                    <div className="fs-2 fw-bold text-info">{result.annualized.carbonReducedTons.toLocaleString()} Tons CO₂e</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted mb-1">Required Carbon Tax to Break Even</div>
                    <div className="fs-2 fw-bold text-warning">${(result.annualized.costPremiumUSD / result.annualized.carbonReducedTons).toFixed(2)} / Ton</div>
                    <div className="small text-muted mt-1">If carbon tax exceeds this, Hydrogen is cheaper.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-100 d-flex align-items-center justify-content-center border-dashed" style={{ borderStyle: 'dashed', borderColor: 'var(--bs-secondary)', backgroundColor: 'transparent' }}>
              <div className="text-center p-5">
                <Flame size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-muted">No Simulation Run</h5>
                <p className="text-secondary mb-0">Adjust the target Hydrogen/Gas mix and click "Run Fuel Transition Simulation" to calculate the financial premium and carbon savings of the transition.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
