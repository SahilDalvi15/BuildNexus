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
            fetchMockAlerts();
        }
    }, [activePlant]);

    const fetchMockAlerts = () => {
        setLoading(true);
        setTimeout(() => {
            setAlerts([
                {
                    _id: 'a1',
                    severity: 'CRITICAL',
                    type: 'PREDICTIVE_MAINTENANCE',
                    machineId: 'M-204',
                    message: 'Failure predicted in next 48 hours (Probability: 82%).',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: 'NEW'
                },
                {
                    _id: 'a2',
                    severity: 'WARNING',
                    type: 'ENERGY_ANOMALY',
                    machineId: 'L-02',
                    message: 'Line 02 consuming 15% more power than baseline during idle state.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                    status: 'ACKNOWLEDGED'
                },
                {
                    _id: 'a3',
                    severity: 'CRITICAL',
                    type: 'QUALITY_RISK',
                    machineId: 'M-105',
                    message: 'High defect probability detected based on temperature variance.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    status: 'RESOLVED'
                }
            ]);
            setLoading(false);
        }, 500);
    };

    const handleAcknowledge = (id) => {
        setAlerts(alerts.map(a => a._id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
        toast.info('Alert acknowledged');
    };

    const handleResolve = (id) => {
        setAlerts(alerts.map(a => a._id === id ? { ...a, status: 'RESOLVED' } : a));
        toast.success('Alert resolved');
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
                            <div key={alert._id} className="card p-3 d-flex flex-row align-items-center justify-content-between hover-lift border-start border-4" style={{ borderLeftColor: alert.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)' }}>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="mt-1">
                                        {alert.severity === 'CRITICAL' ? <AlertTriangle size={24} className="text-danger" /> : <AlertTriangle size={24} className="text-warning" />}
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            {getSeverityBadge(alert.severity)}
                                            <span className="text-white fw-bold">{alert.machineId}</span>
                                            <span className="text-secondary small ms-2">{new Date(alert.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-white m-0">{alert.message}</p>
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <span className="text-secondary small d-flex align-items-center gap-1">
                                                {getStatusIcon(alert.status)} {alert.status}
                                            </span>
                                            <span className="text-secondary small px-2 border-start border-secondary">{alert.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {alert.status === 'NEW' && (
                                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleAcknowledge(alert._id)}>Acknowledge</button>
                                    )}
                                    {alert.status !== 'RESOLVED' && (
                                        <button className="btn btn-sm btn-outline-success" onClick={() => handleResolve(alert._id)}>Resolve</button>
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
