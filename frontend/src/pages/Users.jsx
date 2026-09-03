import React, { useState } from 'react';
import { Users as UsersIcon, Plus, UserPlus, Mail, Shield, MapPin } from 'lucide-react';

const Users = () => {
    // Mock user data
    const [users] = useState([
        { id: 'u1', name: 'Admin User', email: 'admin@buildnexus.com', role: 'System Admin', plant: 'All Plants', status: 'Active' },
        { id: 'u2', name: 'Plant Manager Berlin', email: 'manager@buildnexus.com', role: 'Plant Manager', plant: 'Berlin Assembly Plant', status: 'Active' },
        { id: 'u3', name: 'Tech Lead', email: 'tech@buildnexus.com', role: 'Technician', plant: 'Berlin Assembly Plant', status: 'Active' },
        { id: 'u4', name: 'QA Specialist', email: 'qa@buildnexus.com', role: 'QA Analyst', plant: 'Munich Foundry', status: 'Inactive' }
    ]);

    const getRoleBadge = (role) => {
        switch(role) {
            case 'System Admin': return <span className="badge bg-danger">Admin</span>;
            case 'Plant Manager': return <span className="badge bg-primary">Manager</span>;
            case 'QA Analyst': return <span className="badge bg-info text-dark">QA</span>;
            default: return <span className="badge bg-secondary">{role}</span>;
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title d-flex align-items-center gap-2">
                        <UsersIcon className="text-primary" /> User Management
                    </h1>
                    <p className="page-subtitle">Manage platform access, roles, and plant assignments.</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" style={{ borderRadius: '8px' }}>
                    <UserPlus size={18} /> Add User
                </button>
            </div>

            <div className="row g-4">
                {users.map(user => (
                    <div className="col-md-6 col-lg-4" key={user.id}>
                        <div className="card p-4 h-100 hover-lift">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="avatar rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: '50px', height: '50px', background: 'var(--primary)', color: 'white' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="m-0 text-white fs-6">{user.name}</h4>
                                        <div className="mt-1">{getRoleBadge(user.role)}</div>
                                    </div>
                                </div>
                                <div>
                                    {user.status === 'Active' ? (
                                        <span className="badge bg-success bg-opacity-25 text-success border border-success">Active</span>
                                    ) : (
                                        <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary">Inactive</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                                <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                                    <Mail size={14} /> {user.email}
                                </div>
                                <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                                    <Shield size={14} /> {user.role}
                                </div>
                                <div className="d-flex align-items-center gap-2 text-secondary small">
                                    <MapPin size={14} /> {user.plant}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 d-flex gap-2">
                                <button className="btn btn-sm btn-outline-secondary flex-grow-1">Edit</button>
                                <button className="btn btn-sm btn-outline-danger flex-grow-1">Revoke Access</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Users;
