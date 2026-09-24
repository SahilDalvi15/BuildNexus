import React, { useState } from 'react';
import axios from 'axios';
import { AlertOctagon, Droplet, Zap, Package, DollarSign, Leaf } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DefectImpactTracker() {
  const [defectAmount, setDefectAmount] = useState(100);
  const [unit, setUnit] = useState('meters');
  const [productType, setProductType] = useState('Flat Glass (6mm)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/quality/defect-impact`, {
        defectAmount,
        unit,
        productType
      }, { headers });
      setResult(res.data.data);
      toast.success('Defect impact calculated');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to calculate impact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in pb-5">
      <div className="mb-4">
        <h1 className="page-title mb-1 d-flex align-items-center gap-2">
          <AlertOctagon size={28} className="text-danger" />
          Saint-Gobain Defect Impact Tracker
        </h1>
        <p className="page-subtitle">Translate physical continuous manufacturing defects (scrap) directly into wasted energy, carbon penalties, and total financial loss.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100 border-start border-4 border-danger">
            <h5 className="mb-4">Defect Parameters</h5>
            
            <div className="mb-3">
              <label className="form-label text-muted">Product Type</label>
              <select 
                className="form-select bg-dark text-white border-secondary"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="Flat Glass (6mm)">Flat Glass (6mm)</option>
                <option value="Automotive Glass">Automotive Glass</option>
                <option value="Gypsum Board (12mm)">Gypsum Board (12mm)</option>
                <option value="Insulation Roll">Insulation Roll</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Unit of Measure</label>
              <select 
                className="form-select bg-dark text-white border-secondary"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="meters">Linear Meters</option>
                <option value="sq_meters">Square Meters</option>
                <option value="tons">Metric Tons</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted">Defect Amount (Scrapped)</label>
              <input 
                type="number" className="form-control bg-dark text-white border-secondary" 
                value={defectAmount} onChange={(e) => setDefectAmount(Number(e.target.value))} 
              />
            </div>

            <button 
              className="btn btn-danger w-100 py-2 fw-bold" 
              onClick={runSimulation} 
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <AlertOctagon size={18} className="me-2" />}
              Calculate True Penalty
            </button>
          </div>
        </div>

        <div className="col-lg-8">
          {result ? (
            <div className="fade-in">
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="card bg-danger bg-opacity-10 border border-danger p-4 text-center hover-lift">
                    <h5 className="text-danger mb-2">Total Financial Penalty of Defect</h5>
                    <h1 className="text-danger m-0 display-4 fw-bold">
                      ${result.penalties.totalFinancialPenaltyUSD.toLocaleString()}
                    </h1>
                    <p className="text-muted mt-2 mb-0">For scrapping {result.defectAmount} {result.unit} of {result.productType}</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-dark border border-warning h-100 hover-lift">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <Zap size={20} className="text-warning me-2" />
                        <h6 className="m-0 text-white">Wasted Energy</h6>
                      </div>
                      <span className="text-warning fw-bold">${result.penalties.breakdown.energyLossUSD.toLocaleString()}</span>
                    </div>
                    <h3 className="text-warning m-0">{result.penalties.energyWastedKwh.toLocaleString()} <span className="fs-6 text-muted">kWh lost</span></h3>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-dark border border-info h-100 hover-lift">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <Droplet size={20} className="text-info me-2" />
                        <h6 className="m-0 text-white">Wasted Water</h6>
                      </div>
                      <span className="text-info fw-bold">${result.penalties.breakdown.waterLossUSD.toLocaleString()}</span>
                    </div>
                    <h3 className="text-info m-0">{result.penalties.waterWastedLiters.toLocaleString()} <span className="fs-6 text-muted">Liters lost</span></h3>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-dark border border-secondary h-100 hover-lift">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <Package size={20} className="text-secondary me-2" />
                        <h6 className="m-0 text-white">Wasted Raw Material</h6>
                      </div>
                      <span className="text-white fw-bold">${result.penalties.breakdown.materialLossUSD.toLocaleString()}</span>
                    </div>
                    <h3 className="text-white m-0">{result.penalties.materialWastedKg.toLocaleString()} <span className="fs-6 text-muted">kg lost</span></h3>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-dark border border-success h-100 hover-lift">
                    <div className="d-flex align-items-center mb-3">
                      <Leaf size={20} className="text-success me-2" />
                      <h6 className="m-0 text-white">Embodied Carbon Penalty</h6>
                    </div>
                    <h3 className="text-success m-0">{result.penalties.carbonPenaltyKgCO2e.toLocaleString()} <span className="fs-6 text-muted">kg CO₂e</span></h3>
                    <div className="mt-2 text-muted small">Carbon footprint emitted for zero sellable product.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-100 d-flex align-items-center justify-content-center border-dashed" style={{ borderStyle: 'dashed', borderColor: 'var(--bs-secondary)', backgroundColor: 'transparent' }}>
              <div className="text-center p-5">
                <AlertOctagon size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-muted">No Defect Logged</h5>
                <p className="text-secondary mb-0">Enter a scrapped amount of product to instantly calculate the true operational and environmental penalty of the defect.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
