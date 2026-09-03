import React, { useState } from 'react';
import { Search, Shield, Clock, User, FileText } from 'lucide-react';

const AuditLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Mock data based on the Backend AuditLog schema (Release 3)
    const [logs] = useState([
        { id: 'log-1', action: 'MODEL_UPDATE', user: 'admin@buildnexus.com', role: 'System Admin', details: 'Activated Anomaly Model v2', ip: '192.168.1.105', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: 'log-2', action: 'PLANT_CONFIG_CHANGE', user: 'manager@buildnexus.com', role: 'Plant Manager', details: 'Updated CO2 emission factor', ip: '10.0.0.52', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
        { id: 'log-3', action: 'WORK_ORDER_CLOSE', user: 'tech@buildnexus.com', role: 'Technician', details: 'Closed WO-1049 (Bearing replacement)', ip: '10.0.1.12', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 'log-4', action: 'USER_LOGIN', user: 'admin@buildnexus.com', role: 'System Admin', details: 'Successful authentication', ip: '192.168.1.105', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
    ]);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title d-flex align-items-center gap-2">
                        <Shield className="text-primary" /> Audit Logs
                    </h1>
                    <p className="page-subtitle">Security traceability for all administrative and operational actions.</p>
                </div>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <FileText size={16} /> Export CSV
                </button>
            </div>

            <div className="card mb-4 p-3">
                <div className="input-group" style={{ maxWidth: '400px' }}>
                    <span className="input-group-text bg-dark border-secondary text-secondary"><Search size={18} /></span>
                    <input 
                        type="text" 
                        className="form-control bg-dark border-secondary text-white" 
                        placeholder="Search logs by action, user, or detail..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Action</th>
                                <th>User</th>
                                <th>Details</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="align-middle">
                                    <td className="text-secondary small">
                                        <Clock size={14} className="me-2" />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <User size={14} className="text-primary" />
                                            <div>
                                                <div className="text-white small">{log.user}</div>
                                                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>{log.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-white small">{log.details}</td>
                                    <td className="text-secondary small font-monospace">{log.ip}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No audit logs found matching criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
