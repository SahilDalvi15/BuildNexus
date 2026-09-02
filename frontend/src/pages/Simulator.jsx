import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Play, TrendingUp, AlertTriangle, Zap, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Simulator = () => {
    const { activePlant } = useContext(PlantContext);
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Simulation parameters
    const [temperature, setTemperature] = useState(70);
    const [vibration, setVibration] = useState(2.5);
    const [productionRate, setProductionRate] = useState(1000);

    const [simResult, setSimResult] = useState(null);

    useEffect(() => {
        if (activePlant) fetchMachines();
    }, [activePlant]);

    const fetchMachines = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/machines`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMachines(res.data);
            if (res.data.length > 0) setSelectedMachine(res.data[0]._id);
        } catch (error) {
            console.error('Error fetching machines:', error);
        }
    };

    const runSimulation = async () => {
        if (!selectedMachine) return toast.warning('Select a machine first');
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = {
                machineId: selectedMachine,
                modifications: { temperature, vibration, productionRate }
            };
            
            const res = await axios.post(`http://localhost:5000/api/simulator/run`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSimResult(res.data);
            toast.success('Simulation completed');
        } catch (error) {
            console.error('Simulation error:', error);
            toast.error('Simulation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header mb-4">
                <h1 className="page-title">What-If Simulator</h1>
                <p className="page-subtitle">Test hypothetical parameters to predict impact on machine health and production.</p>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card h-100">
                        <h3 className="mb-4 d-flex align-items-center gap-2">
                            <Settings size={20} className="text-primary" /> Parameters
                        </h3>
                        
                        <div className="mb-4">
                            <label className="form-label text-secondary small">Target Machine</label>
                            <select 
                                className="form-control bg-dark border-secondary text-white" 
                                value={selectedMachine} 
                                onChange={(e) => setSelectedMachine(e.target.value)}
                            >
                                {machines.map(m => (
                                    <option key={m._id} value={m._id}>{m.name} ({m.machineId})</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-secondary small d-flex justify-content-between">
                                <span>Operating Temperature (°C)</span>
                                <span className="text-white fw-bold">{temperature}</span>
                            </label>
                            <input 
                                type="range" 
                                className="form-range" 
                                min="20" max="150" step="1" 
                                value={temperature} 
                                onChange={(e) => setTemperature(Number(e.target.value))} 
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-secondary small d-flex justify-content-between">
                                <span>Vibration Level (mm/s)</span>
                                <span className="text-white fw-bold">{vibration}</span>
                            </label>
                            <input 
                                type="range" 
                                className="form-range" 
                                min="0" max="10" step="0.1" 
                                value={vibration} 
                                onChange={(e) => setVibration(Number(e.target.value))} 
                            />
                        </div>

                        <div className="mb-5">
                            <label className="form-label text-secondary small d-flex justify-content-between">
                                <span>Production Rate (units/hr)</span>
                                <span className="text-white fw-bold">{productionRate}</span>
                            </label>
                            <input 
                                type="range" 
                                className="form-range" 
                                min="500" max="2500" step="50" 
                                value={productionRate} 
                                onChange={(e) => setProductionRate(Number(e.target.value))} 
                            />
                        </div>

                        <button 
                            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={runSimulation}
                            disabled={loading}
                            style={{ padding: '12px', fontWeight: '600', borderRadius: '8px' }}
                        >
                            {loading ? 'Running...' : <><Play size={18} /> Run Simulation</>}
                        </button>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card h-100 d-flex flex-column">
                        <h3 className="mb-4 d-flex align-items-center gap-2">
                            <TrendingUp size={20} className="text-success" /> Simulated Impact
                        </h3>

                        {!simResult ? (
                            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted py-5">
                                <Play size={48} className="opacity-25 mb-3" />
                                <p>Adjust parameters and run simulation to see projected outcomes.</p>
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="p-3 rounded border" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                            <span className="text-secondary small d-block mb-1">Failure Probability</span>
                                            <div className="d-flex align-items-end gap-2">
                                                <span className={`fs-2 fw-bold ${simResult.impact.projectedFailureProbability > 0.5 ? 'text-danger' : 'text-success'}`}>
                                                    {(simResult.impact.projectedFailureProbability * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded border" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                                            <span className="text-secondary small d-block mb-1">Estimated RUL</span>
                                            <div className="d-flex align-items-end gap-2">
                                                <span className="fs-2 fw-bold text-primary">
                                                    {simResult.impact.projectedRulDays} <span className="fs-6 fw-normal text-secondary">days</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 className="text-white mb-3" style={{ fontSize: '1rem' }}>Recommendation</h4>
                                    <div className="d-flex gap-3">
                                        <AlertTriangle size={24} className={simResult.impact.riskLevel === 'CRITICAL' ? 'text-danger' : 'text-warning'} />
                                        <p className="text-secondary m-0">
                                            {simResult.impact.riskLevel === 'CRITICAL' 
                                                ? 'These operating parameters severely degrade machine life. Immediate maintenance required if sustained.' 
                                                : 'Operating parameters are within acceptable thresholds, but accelerated wear is observed.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;
