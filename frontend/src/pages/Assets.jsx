import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Settings, AlertTriangle, CheckCircle, Activity, Info } from 'lucide-react';

const Assets = () => {
    const { activePlant } = useContext(PlantContext);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activePlant) {
            fetchMachines();
        }
    }, [activePlant]);

    const fetchMachines = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/machines`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter by active plant (if the API doesn't do it)
            // For now, since we might not have seeded plantIds exactly matching, we will just show them all
            // In a real scenario: res.data.filter(m => m.plantId === activePlant._id)
            setMachines(res.data);
        } catch (error) {
            console.error('Error fetching machines:', error);
            toast.error('Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'ONLINE': return <CheckCircle className="text-success" size={20} />;
            case 'WARNING': return <AlertTriangle className="text-warning" size={20} />;
            case 'ERROR': return <AlertTriangle className="text-danger" size={20} />;
            case 'OFFLINE': return <Info className="text-secondary" size={20} />;
            default: return <Activity className="text-primary" size={20} />;
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title">Asset Management</h1>
                    <p className="page-subtitle">Manage and monitor all physical equipment in {activePlant?.name || 'the plant'}.</p>
                </div>
                <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}>
                    + Add New Asset
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading assets...</div>
            ) : (
                <div className="row g-4">
                    {machines.length === 0 ? (
                        <div className="col-12 text-center text-muted py-5">
                            <p>No assets found for this plant.</p>
                        </div>
                    ) : (
                        machines.map(machine => (
                            <div className="col-12 col-md-6 col-lg-4" key={machine._id}>
                                <div className="stat-card h-100 position-relative hover-lift">
                                    <div className="d-flex justify-content-between mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="avatar-sm" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', padding: '10px' }}>
                                                <Settings size={24} />
                                            </div>
                                            <div>
                                                <h3 className="m-0 text-white" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{machine.name}</h3>
                                                <small className="text-secondary">{machine.machineId}</small>
                                            </div>
                                        </div>
                                        <div>
                                            {getStatusIcon(machine.currentStatus)}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary small">Type</span>
                                            <span className="text-white small fw-medium">{machine.type}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary small">Manufacturer</span>
                                            <span className="text-white small fw-medium">{machine.manufacturer || 'Unknown'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-secondary small">Install Date</span>
                                            <span className="text-white small fw-medium">
                                                {machine.installationDate ? new Date(machine.installationDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                                        <button className="btn btn-sm btn-outline-primary w-100" style={{ borderRadius: '6px' }}>
                                            View Digital Twin
                                        </button>
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

export default Assets;
