import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Tool, Clock, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import './kanban.css';

const WorkOrders = () => {
    const { activePlant } = useContext(PlantContext);
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activePlant) fetchWorkOrders();
    }, [activePlant]);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/work-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter by plant in frontend if backend doesn't support it yet
            setWorkOrders(res.data);
        } catch (error) {
            console.error('Error fetching work orders:', error);
            toast.error('Failed to load work orders');
        } finally {
            setLoading(false);
        }
    };

    const getColumnOrders = (status) => {
        return workOrders.filter(wo => wo.status === status);
    };

    const renderCard = (wo) => (
        <div key={wo._id} className="kanban-card">
            <div className="d-flex justify-content-between mb-2">
                <span className={`badge ${wo.priority === 'CRITICAL' ? 'bg-danger' : wo.priority === 'HIGH' ? 'bg-warning' : 'bg-primary'}`}>
                    {wo.priority}
                </span>
                <span className="text-secondary small">{wo.workOrderId}</span>
            </div>
            <h4 className="card-title text-white mb-2" style={{ fontSize: '1rem' }}>{wo.issue}</h4>
            <div className="d-flex align-items-center gap-2 mb-2">
                <Tool size={14} className="text-secondary" />
                <span className="text-secondary small">{wo.asset?.name || 'Unknown Asset'}</span>
            </div>
            
            {wo.requiredParts && wo.requiredParts.length > 0 && (
                <div className="mt-2 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                    <span className="text-secondary small d-block mb-1">Required Parts:</span>
                    {wo.requiredParts.map((p, idx) => (
                        <div key={idx} className="d-flex justify-content-between small">
                            <span className="text-white">{p.part?.name || 'Part'}</span>
                            <span className={p.reserved ? 'text-success' : 'text-danger'}>
                                {p.reserved ? 'Reserved' : 'Pending'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="page-container fade-in h-100 d-flex flex-column">
            <div className="page-header mb-4">
                <h1 className="page-title">Work Orders</h1>
                <p className="page-subtitle">Track and manage maintenance activities.</p>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading work orders...</div>
            ) : (
                <div className="kanban-board flex-grow-1">
                    {/* Open Column */}
                    <div className="kanban-column">
                        <div className="column-header border-bottom border-secondary mb-3 pb-2">
                            <h3 className="m-0 d-flex align-items-center gap-2 text-white" style={{ fontSize: '1.1rem' }}>
                                <AlertCircle size={18} className="text-warning" /> OPEN
                            </h3>
                        </div>
                        <div className="column-content">
                            {getColumnOrders('OPEN').map(renderCard)}
                        </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="kanban-column">
                        <div className="column-header border-bottom border-secondary mb-3 pb-2">
                            <h3 className="m-0 d-flex align-items-center gap-2 text-white" style={{ fontSize: '1.1rem' }}>
                                <PlayCircle size={18} className="text-primary" /> IN PROGRESS
                            </h3>
                        </div>
                        <div className="column-content">
                            {getColumnOrders('IN_PROGRESS').map(renderCard)}
                        </div>
                    </div>

                    {/* Waiting Column */}
                    <div className="kanban-column">
                        <div className="column-header border-bottom border-secondary mb-3 pb-2">
                            <h3 className="m-0 d-flex align-items-center gap-2 text-white" style={{ fontSize: '1.1rem' }}>
                                <Clock size={18} className="text-danger" /> WAITING FOR PART
                            </h3>
                        </div>
                        <div className="column-content">
                            {getColumnOrders('WAITING_FOR_PART').map(renderCard)}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="kanban-column">
                        <div className="column-header border-bottom border-secondary mb-3 pb-2">
                            <h3 className="m-0 d-flex align-items-center gap-2 text-white" style={{ fontSize: '1.1rem' }}>
                                <CheckCircle size={18} className="text-success" /> COMPLETED
                            </h3>
                        </div>
                        <div className="column-content">
                            {getColumnOrders('COMPLETED').map(renderCard)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkOrders;
