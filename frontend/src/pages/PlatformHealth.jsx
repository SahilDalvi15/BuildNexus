import React, { useState } from 'react';
import { Activity, Server, Database, Cpu, HardDrive } from 'lucide-react';

const PlatformHealth = () => {
    // Mock system metrics based on Runbook/PRD
    const [metrics] = useState({
        uptime: '99.98%',
        cpu: '42%',
        memory: '64%',
        activeNodes: 3,
        database: {
            status: 'HEALTHY',
            lag: '12ms',
            connections: 145
        },
        mlProxy: {
            status: 'HEALTHY',
            latency: '45ms',
            successRate: '99.9%'
        }
    });

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title d-flex align-items-center gap-2">
                        <Activity className="text-primary" /> Platform Health
                    </h1>
                    <p className="page-subtitle">Real-time system metrics, latency, and infrastructure status.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-label">System Uptime</div>
                        <div className="stat-value text-success">{metrics.uptime}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-label">CPU Usage (Avg)</div>
                        <div className="stat-value text-white">{metrics.cpu}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-label">Memory Usage</div>
                        <div className="stat-value text-white">{metrics.memory}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-label">Active API Nodes</div>
                        <div className="stat-value text-white">{metrics.activeNodes}</div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card h-100">
                        <h3 className="mb-4 d-flex align-items-center gap-2">
                            <Database size={20} className="text-primary" /> Database Cluster (MongoDB)
                        </h3>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                            <span className="text-secondary">Cluster Status</span>
                            <span className="badge bg-success bg-opacity-25 text-success border border-success">{metrics.database.status}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                            <span className="text-secondary">Replication Lag</span>
                            <span className="text-white fw-bold">{metrics.database.lag}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-secondary">Active Connections</span>
                            <span className="text-white fw-bold">{metrics.database.connections}</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card h-100">
                        <h3 className="mb-4 d-flex align-items-center gap-2">
                            <Cpu size={20} className="text-warning" /> ML Inference Service (Flask)
                        </h3>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                            <span className="text-secondary">Service Status</span>
                            <span className="badge bg-success bg-opacity-25 text-success border border-success">{metrics.mlProxy.status}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                            <span className="text-secondary">Average Latency</span>
                            <span className="text-white fw-bold">{metrics.mlProxy.latency}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-secondary">Success Rate</span>
                            <span className="text-white fw-bold">{metrics.mlProxy.successRate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformHealth;
