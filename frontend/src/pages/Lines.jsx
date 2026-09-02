import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity, Zap, Shield, Play } from 'lucide-react';

const ProductionLines = () => {
    const { activePlant } = useContext(PlantContext);
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activePlant) {
            // Because we don't have a standalone production lines GET API yet, 
            // we will fetch the digital twin layout and extract the lines.
            fetchLines();
        }
    }, [activePlant]);

    const fetchLines = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/digital-twin/layout/${activePlant.plantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Extract lines from the nested digital twin structure
            let extractedLines = [];
            if (res.data.zones) {
                res.data.zones.forEach(zone => {
                    if (zone.lines) {
                        extractedLines.push(...zone.lines);
                    }
                });
            }
            setLines(extractedLines);
        } catch (error) {
            console.error('Error fetching lines:', error);
            toast.error('Failed to load production lines');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title">Production Lines</h1>
                    <p className="page-subtitle">Monitor throughput, OEE, and status across all lines in {activePlant?.name || 'the plant'}.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading production lines...</div>
            ) : (
                <div className="row g-4">
                    {lines.length === 0 ? (
                        <div className="col-12 text-center text-muted py-5">
                            <p>No production lines found. The Digital Twin API might not have data for this plant yet.</p>
                            <button className="btn btn-outline-secondary mt-3">Configure Plant Layout</button>
                        </div>
                    ) : (
                        lines.map((line, idx) => (
                            <div className="col-12" key={line._id || idx}>
                                <div className="stat-card position-relative hover-lift">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <h3 className="m-0 text-white" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{line.name}</h3>
                                                <span className="badge bg-success bg-opacity-25 text-success mt-1">RUNNING</span>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-white fw-bold fs-4">87%</div>
                                            <div className="text-secondary small">Current OEE</div>
                                        </div>
                                    </div>
                                    
                                    <div className="row g-3 border-top pt-3" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Shield size={16} className="text-primary" />
                                                <span className="text-secondary small">Quality Rate</span>
                                            </div>
                                            <div className="text-white fw-medium">99.2%</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Zap size={16} className="text-warning" />
                                                <span className="text-secondary small">Energy Intensity</span>
                                            </div>
                                            <div className="text-white fw-medium">42 kWh/unit</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Play size={16} className="text-success" />
                                                <span className="text-secondary small">Active Machines</span>
                                            </div>
                                            <div className="text-white fw-medium">{line.machines?.length || 0} Assets</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductionLines;
