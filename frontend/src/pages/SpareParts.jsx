import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Box, AlertTriangle, Search, Package } from 'lucide-react';

const SpareParts = () => {
    const { activePlant } = useContext(PlantContext);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activePlant) fetchParts();
    }, [activePlant]);

    const fetchParts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/parts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParts(res.data);
        } catch (error) {
            console.error('Error fetching spare parts:', error);
            toast.error('Failed to load spare parts');
        } finally {
            setLoading(false);
        }
    };

    const filteredParts = parts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container fade-in">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title">Spare Parts Inventory</h1>
                    <p className="page-subtitle">Manage stock levels and track reserved parts across {activePlant?.name || 'the plant'}.</p>
                </div>
                <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}>
                    + Receive Parts
                </button>
            </div>

            <div className="card mb-4" style={{ padding: '1rem' }}>
                <div className="d-flex align-items-center bg-dark rounded px-3 border border-secondary" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="text-secondary" />
                    <input 
                        type="text" 
                        className="form-control border-0 bg-transparent text-white shadow-none" 
                        placeholder="Search by part name or number..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading inventory...</div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover table-dark mb-0">
                            <thead>
                                <tr>
                                    <th>Part Detail</th>
                                    <th>Location</th>
                                    <th>Quantity</th>
                                    <th>Reserved</th>
                                    <th>Available</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">No parts found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredParts.map(part => {
                                        const available = part.quantity - part.reservedQuantity;
                                        const isLowStock = available <= part.minimumStock;
                                        
                                        return (
                                            <tr key={part._id} className="align-middle">
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="avatar-sm" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px' }}>
                                                            <Package size={18} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium text-white">{part.name}</div>
                                                            <small className="text-secondary">{part.partNumber}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-secondary">{part.location}</td>
                                                <td>{part.quantity}</td>
                                                <td className="text-warning">{part.reservedQuantity}</td>
                                                <td className="fw-bold">{available}</td>
                                                <td>
                                                    {isLowStock ? (
                                                        <span className="badge bg-danger bg-opacity-25 text-danger border border-danger d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                                            <AlertTriangle size={12} /> Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-success bg-opacity-25 text-success border border-success">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-secondary">Adjust</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpareParts;
