import React, { useState } from 'react';
import { Database, Link, Server, RefreshCw, Key } from 'lucide-react';
import { toast } from 'react-toastify';

const DataIntegrations = () => {
    const [gateways] = useState([
        { id: 'gw-berlin-01', name: 'Berlin Main Edge Gateway', status: 'ONLINE', lastSync: new Date().toISOString() },
        { id: 'gw-munich-02', name: 'Munich Foundry Edge', status: 'OFFLINE', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
    ]);

    const [apiKeys] = useState([
        { id: 'key-1', name: 'MES Integration API Key', prefix: 'sk_live_abc123...', created: '2026-08-15' },
        { id: 'key-2', name: 'ERP Read-Only Key', prefix: 'sk_live_xyz987...', created: '2026-09-01' }
    ]);

    const handleGenerateKey = () => {
        toast.success('New API Key generated successfully');
    };

    const handleSync = (id) => {
        toast.info(`Triggered manual sync for gateway ${id}`);
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title">Data & Integrations</h1>
                    <p className="page-subtitle">Manage Edge Gateways and API access keys.</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Edge Gateways */}
                <div className="col-lg-7">
                    <div className="card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="m-0 d-flex align-items-center gap-2">
                                <Server size={20} className="text-primary" /> Edge Gateways
                            </h3>
                            <button className="btn btn-sm btn-outline-primary">Register Gateway</button>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Gateway</th>
                                        <th>Status</th>
                                        <th>Last Sync</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gateways.map(gw => (
                                        <tr key={gw.id} className="align-middle">
                                            <td>
                                                <div className="fw-medium text-white">{gw.name}</div>
                                                <small className="text-secondary">{gw.id}</small>
                                            </td>
                                            <td>
                                                {gw.status === 'ONLINE' ? (
                                                    <span className="badge bg-success bg-opacity-25 text-success border border-success">ONLINE</span>
                                                ) : (
                                                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">OFFLINE</span>
                                                )}
                                            </td>
                                            <td className="text-secondary small">{new Date(gw.lastSync).toLocaleString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-icon text-primary" onClick={() => handleSync(gw.id)} title="Force Sync">
                                                    <RefreshCw size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="col-lg-5">
                    <div className="card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="m-0 d-flex align-items-center gap-2">
                                <Key size={20} className="text-warning" /> API Keys
                            </h3>
                            <button className="btn btn-sm btn-outline-warning" onClick={handleGenerateKey}>Generate Key</button>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {apiKeys.map(key => (
                                <div key={key.id} className="p-3 rounded border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="fw-medium text-white">{key.name}</div>
                                        <button className="btn btn-sm text-danger p-0">Revoke</button>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-end">
                                        <code className="text-secondary bg-dark px-2 py-1 rounded">{key.prefix}</code>
                                        <small className="text-muted">Created: {key.created}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataIntegrations;
