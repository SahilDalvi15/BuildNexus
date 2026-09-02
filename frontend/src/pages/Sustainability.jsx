import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Leaf, Wind, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Sustainability = () => {
    const { activePlant } = useContext(PlantContext);
    const [co2Data, setCo2Data] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activePlant) {
            // Fetch mock sustainability data or from API if ready
            setLoading(true);
            setTimeout(() => {
                setCo2Data([
                    { month: 'Jan', emissions: 120, target: 140 },
                    { month: 'Feb', emissions: 110, target: 135 },
                    { month: 'Mar', emissions: 105, target: 130 },
                    { month: 'Apr', emissions: 98, target: 125 },
                    { month: 'May', emissions: 92, target: 120 },
                    { month: 'Jun', emissions: 85, target: 115 }
                ]);
                setLoading(false);
            }, 500);
        }
    }, [activePlant]);

    return (
        <div className="page-container fade-in">
            <div className="page-header mb-4">
                <h1 className="page-title">Sustainability & CO₂ Tracking</h1>
                <p className="page-subtitle">Monitor plant emissions, energy intensity, and progress towards net-zero goals.</p>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="stat-card position-relative hover-lift">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
                                <Leaf size={24} />
                            </div>
                            <h3 className="m-0 text-white" style={{ fontSize: '1rem', fontWeight: '500' }}>YTD CO₂ Emissions</h3>
                        </div>
                        <div className="text-white fw-bold fs-2">610<span className="fs-6 text-secondary ms-1">tons</span></div>
                        <div className="text-success small mt-2">↓ 14% vs last year</div>
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="stat-card position-relative hover-lift">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px' }}>
                                <Wind size={24} />
                            </div>
                            <h3 className="m-0 text-white" style={{ fontSize: '1rem', fontWeight: '500' }}>Carbon Intensity</h3>
                        </div>
                        <div className="text-white fw-bold fs-2">0.38<span className="fs-6 text-secondary ms-1">kg/kWh</span></div>
                        <div className="text-primary small mt-2">Current grid factor</div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="stat-card position-relative hover-lift">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="avatar" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px' }}>
                                <Activity size={24} />
                            </div>
                            <h3 className="m-0 text-white" style={{ fontSize: '1rem', fontWeight: '500' }}>Energy Intensity</h3>
                        </div>
                        <div className="text-white fw-bold fs-2">42<span className="fs-6 text-secondary ms-1">kWh/unit</span></div>
                        <div className="text-warning small mt-2">↑ 2% vs target</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ height: '400px' }}>
                <h3 className="mb-4">Monthly CO₂ Emissions vs Target</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={co2Data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                        <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                        <Bar dataKey="emissions" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Emissions" />
                        <Bar dataKey="target" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Target" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Sustainability;
