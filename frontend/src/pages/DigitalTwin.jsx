import React, { useState, useEffect, useContext } from 'react';
import { PlantContext } from '../context/PlantContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Map, Layers, Box, Settings } from 'lucide-react';

const DigitalTwin = () => {
    const { activePlant } = useContext(PlantContext);
    const [layout, setLayout] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState(null);

    useEffect(() => {
        if (activePlant) fetchLayout();
    }, [activePlant]);

    const fetchLayout = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/digital-twin/layout/${activePlant.plantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLayout(res.data);
        } catch (error) {
            console.error('Error fetching layout:', error);
            toast.error('Failed to load digital twin layout');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (entity, type) => {
        setSelectedEntity({ ...entity, _type: type });
    };

    return (
        <div className="page-container fade-in h-100 d-flex flex-column">
            <div className="page-header mb-4">
                <h1 className="page-title">Digital Twin 2D View</h1>
                <p className="page-subtitle">Spatial hierarchy and real-time asset positioning.</p>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading spatial layout...</div>
            ) : !layout ? (
                <div className="text-center py-5 text-muted">No spatial data available.</div>
            ) : (
                <div className="row flex-grow-1" style={{ minHeight: '500px' }}>
                    <div className="col-lg-8 h-100">
                        <div className="card h-100 p-0 overflow-hidden" style={{ background: '#0a0b12', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'rgba(59, 130, 246, 0.2) !important', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <Map size={18} className="text-primary" />
                                <span className="text-primary fw-medium">Plant Coordinate System (X, Y)</span>
                            </div>
                            
                            <div className="position-relative w-100 h-100 p-4" style={{ minHeight: '600px', backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                                {/* Mock rendering of zones as absolute positioned boxes */}
                                {layout.zones && layout.zones.map((zone, zIdx) => (
                                    <div 
                                        key={zone._id} 
                                        onClick={() => handleSelect(zone, 'Zone')}
                                        className="position-absolute border"
                                        style={{
                                            top: `${(zIdx * 150) + 50}px`,
                                            left: `${(zIdx % 2 * 300) + 50}px`,
                                            width: '280px',
                                            minHeight: '200px',
                                            borderColor: selectedEntity?._id === zone._id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div className="p-2 border-bottom text-secondary small d-flex justify-content-between" style={{ borderColor: 'rgba(255,255,255,0.1) !important', background: 'rgba(0,0,0,0.2)' }}>
                                            <span>{zone.name}</span>
                                            <Layers size={14} />
                                        </div>
                                        
                                        <div className="p-2">
                                            {/* Lines inside Zone */}
                                            {zone.lines && zone.lines.map((line, lIdx) => (
                                                <div 
                                                    key={line._id}
                                                    onClick={(e) => { e.stopPropagation(); handleSelect(line, 'Line'); }}
                                                    className="border rounded p-2 mb-2"
                                                    style={{ 
                                                        borderColor: selectedEntity?._id === line._id ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                        background: 'rgba(16, 185, 129, 0.05)'
                                                    }}
                                                >
                                                    <span className="small text-success d-block mb-2">{line.name}</span>
                                                    
                                                    {/* Machines inside Line */}
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        {line.machines && line.machines.map(m => (
                                                            <div 
                                                                key={m._id}
                                                                onClick={(e) => { e.stopPropagation(); handleSelect(m, 'Machine'); }}
                                                                className="avatar-sm d-flex align-items-center justify-content-center"
                                                                title={m.name}
                                                                style={{ 
                                                                    background: m.currentStatus === 'ONLINE' ? '#10b981' : (m.currentStatus === 'WARNING' ? '#f59e0b' : '#ef4444'),
                                                                    borderRadius: '4px',
                                                                    width: '30px', height: '30px',
                                                                    border: selectedEntity?._id === m._id ? '2px solid white' : 'none'
                                                                }}
                                                            >
                                                                <Settings size={14} className="text-white" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card h-100">
                            <h3 className="mb-4">Properties</h3>
                            {selectedEntity ? (
                                <div className="fade-in">
                                    <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                                        <div className="avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                            {selectedEntity._type === 'Machine' ? <Settings size={24} /> : selectedEntity._type === 'Line' ? <Layers size={24} /> : <Box size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="m-0 text-white">{selectedEntity.name}</h4>
                                            <span className="text-secondary small">{selectedEntity._type}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between">
                                            <span className="text-secondary small">ID</span>
                                            <span className="text-white small">{selectedEntity.machineId || selectedEntity.lineId || selectedEntity.zoneId || selectedEntity._id}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-secondary small">Status</span>
                                            <span className="text-white small fw-bold">{selectedEntity.currentStatus || 'ACTIVE'}</span>
                                        </div>
                                        
                                        {selectedEntity.spatialCoordinates && (
                                            <>
                                                <h5 className="text-white mt-3 mb-2" style={{ fontSize: '0.9rem' }}>Coordinates</h5>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-secondary small">X</span>
                                                    <span className="text-white small">{selectedEntity.spatialCoordinates.x || 0}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-secondary small">Y</span>
                                                    <span className="text-white small">{selectedEntity.spatialCoordinates.y || 0}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <Box size={40} className="mb-3 opacity-50" />
                                    <p>Select an entity on the layout to view properties.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalTwin;
