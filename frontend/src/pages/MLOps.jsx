import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity, Brain, Server, CheckCircle, AlertTriangle } from 'lucide-react';

const MLOps = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/ml/models`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModels(res.data.data.models);
        } catch (error) {
            console.error('Error fetching ML models:', error);
            toast.error('Failed to load ML models');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title">ML Operations (MLOps)</h1>
                    <p className="page-subtitle">Manage deployed AI models and inference endpoints.</p>
                </div>
                <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}>
                    + Deploy New Model
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading models...</div>
            ) : (
                <div className="row g-4">
                    {models.length === 0 ? (
                        <div className="col-12 text-center text-muted py-5">
                            <Brain size={40} className="mx-auto mb-3 opacity-50" />
                            <p>No ML models registered in the system.</p>
                        </div>
                    ) : (
                        models.map(model => (
                            <div className="col-md-6 col-lg-4" key={model._id}>
                                <div className="stat-card h-100 position-relative hover-lift">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px' }}>
                                                <Brain size={24} />
                                            </div>
                                            <div>
                                                <h3 className="m-0 text-white" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{model.name}</h3>
                                                <span className="badge bg-primary bg-opacity-25 text-primary mt-1">v{model.version}</span>
                                            </div>
                                        </div>
                                        <div>
                                            {model.isActive ? (
                                                <CheckCircle className="text-success" size={20} title="Active" />
                                            ) : (
                                                <AlertTriangle className="text-warning" size={20} title="Inactive" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary small">Type</span>
                                            <span className="text-white small fw-medium">{model.type.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary small">Endpoint</span>
                                            <span className="text-secondary small text-truncate" style={{ maxWidth: '150px' }} title={model.endpoint}>
                                                {model.endpoint}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-secondary small">Deployed</span>
                                            <span className="text-white small fw-medium">
                                                {new Date(model.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-top d-flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                                        <button className="btn btn-sm btn-outline-secondary flex-grow-1" style={{ borderRadius: '6px' }}>
                                            Metrics
                                        </button>
                                        <button className={`btn btn-sm flex-grow-1 ${model.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} style={{ borderRadius: '6px' }}>
                                            {model.isActive ? 'Deactivate' : 'Activate'}
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

export default MLOps;
