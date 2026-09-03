import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const Reports = () => {
    const [reports] = useState([
        { id: 'r1', name: 'Monthly OEE Summary', type: 'Production', date: '2026-08-31', size: '2.4 MB' },
        { id: 'r2', name: 'Sustainability & CO2 Compliance', type: 'Energy', date: '2026-08-31', size: '1.1 MB' },
        { id: 'r3', name: 'Predictive Maintenance Accuracy Audit', type: 'MLOps', date: '2026-08-15', size: '3.8 MB' },
        { id: 'r4', name: 'Quality Defect Pareto', type: 'Quality', date: '2026-08-01', size: '840 KB' }
    ]);

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title d-flex align-items-center gap-2">
                        <FileText className="text-primary" /> Reports & Exports
                    </h1>
                    <p className="page-subtitle">Generate and download historical compliance and operational reports.</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" style={{ borderRadius: '8px' }}>
                    <Plus size={18} /> Generate Custom Report
                </button>
            </div>

            <div className="card mb-4 p-3 d-flex flex-row gap-3 align-items-center">
                <Filter size={18} className="text-secondary" />
                <select className="form-select bg-dark border-secondary text-white w-auto">
                    <option>All Types</option>
                    <option>Production</option>
                    <option>Energy</option>
                    <option>Quality</option>
                </select>
                <div className="input-group w-auto">
                    <span className="input-group-text bg-dark border-secondary text-secondary"><Calendar size={18} /></span>
                    <input type="month" className="form-control bg-dark border-secondary text-white" defaultValue="2026-08" />
                </div>
            </div>

            <div className="row g-4">
                {reports.map(report => (
                    <div className="col-md-6" key={report.id}>
                        <div className="card p-4 h-100 hover-lift d-flex flex-row align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-4">
                                <div className="p-3 bg-secondary bg-opacity-10 rounded text-secondary">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h4 className="text-white m-0 fs-5 mb-1">{report.name}</h4>
                                    <div className="d-flex align-items-center gap-3 text-secondary small">
                                        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary">{report.type}</span>
                                        <span>{report.date}</span>
                                        <span>{report.size}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-outline-secondary btn-icon rounded-circle p-2">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Simple Plus icon component for the button since it wasn't imported from lucide-react above
const Plus = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default Reports;
