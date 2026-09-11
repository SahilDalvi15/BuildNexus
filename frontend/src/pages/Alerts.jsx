import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import { AlertTriangle, Bell, Filter, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Alerts = () => {
    const { activePlant } = useContext(PlantContext);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, WARNING, RESOLVED

    useEffect(() => {
        if (activePlant) {
            fetchAlerts();
        }
    }, [activePlant]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(res.data.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/alerts/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(alerts.map(a => a._id === id ? { ...a, status } : a));
            if (status === 'ACKNOWLEDGED') toast.info('Alert acknowledged');
            if (status === 'RESOLVED') toast.success('Alert resolved');
        } catch (error) {
            toast.error('Failed to update alert status');
        }
    };

    const getSeverityBadge = (severity) => {
        switch(severity) {
            case 'CRITICAL': return <span className="badge bg-danger">CRITICAL</span>;
            case 'WARNING': return <span className="badge bg-warning text-dark">WARNING</span>;
            case 'INFO': return <span className="badge bg-info text-dark">INFO</span>;
            default: return <span className="badge bg-secondary">UNKNOWN</span>;
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'NEW': return <Bell size={16} className="text-danger" />;
            case 'ACKNOWLEDGED': return <Clock size={16} className="text-warning" />;
            case 'RESOLVED': return <CheckCircle size={16} className="text-success" />;
            default: return null;
        }
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'ALL') return a.status !== 'RESOLVED';
        if (filter === 'RESOLVED') return a.status === 'RESOLVED';
        return a.severity === filter && a.status !== 'RESOLVED';
    });

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title">Alerts & Notifications</h1>
                    <p className="page-subtitle">Prioritized operational and ML anomalies for {activePlant?.name || 'the plant'}.</p>
                </div>
            </div>

            <div className="card mb-4 p-3 d-flex flex-row gap-3 align-items-center">
                <Filter size={18} className="text-secondary" />
                <button className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter('ALL')}>Active Alerts</button>
                <button className={`btn btn-sm ${filter === 'CRITICAL' ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setFilter('CRITICAL')}>Critical</button>
                <button className={`btn btn-sm ${filter === 'WARNING' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`} onClick={() => setFilter('WARNING')}>Warnings</button>
                <button className={`btn btn-sm ${filter === 'RESOLVED' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setFilter('RESOLVED')}>Resolved</button>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading alerts...</div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {filteredAlerts.length === 0 ? (
                        <div className="card p-5 text-center text-muted">
                            <CheckCircle size={40} className="mx-auto mb-3 opacity-50 text-success" />
                            <h4>All clear!</h4>
                            <p>No alerts matching this filter.</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => (
                            <div key={alert._id} className="card p-3 d-flex flex-row align-items-center justify-content-between hover-lift border-start border-4" style={{ borderLeftColor: alert.severityLevel >= 8 ? 'var(--danger)' : 'var(--warning)' }}>
                                <div className="d-flex align-items-start gap-3 w-100 me-3">
                                    <div className="mt-1">
                                        <div className={`p-2 rounded ${alert.severityLevel >= 8 ? 'bg-danger text-white' : 'bg-warning text-dark'}`}>
                                            <span className="fw-bold">{alert.priorityScore}</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            {getSeverityBadge(alert.severityLevel >= 8 ? 'CRITICAL' : 'WARNING')}
                                            <span className="text-white fw-bold">{alert.machineId?.name || alert.machineId}</span>
                                            <span className="text-secondary small ms-2">{new Date(alert.createdAt).toLocaleString()}</span>
                                            <span className="badge bg-dark border ms-auto">{alert.type}</span>
                                        </div>
                                        <h6 className="text-white mb-1">{alert.title}</h6>
                                        <p className="text-muted m-0 small">{alert.message}</p>
                                        
                                        {alert.priorityExplanation && alert.priorityExplanation.length > 0 && (
                                            <div className="mt-2 d-flex gap-2 flex-wrap">
                                                {alert.priorityExplanation.map((exp, i) => (
                                                    <span key={i} className="badge bg-secondary opacity-75">{exp}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <span className="text-secondary small d-flex align-items-center gap-1">
                                                {getStatusIcon(alert.status)} {alert.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-2 flex-shrink-0">
                                    {alert.status === 'NEW' && (
                                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleUpdateStatus(alert._id, 'ACKNOWLEDGED')}>Acknowledge</button>
                                    )}
                                    {alert.status !== 'RESOLVED' && (
                                        <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateStatus(alert._id, 'RESOLVED')}>Resolve</button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Alerts;
