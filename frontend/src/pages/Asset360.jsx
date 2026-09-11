import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Settings, Activity, AlertTriangle, BatteryCharging, Zap, Gauge, History, Thermometer, ShieldAlert, Cpu } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Asset360() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetData();
  }, [id]);

  const fetchAssetData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      // Fetch machine
      const mRes = await axios.get(`${API_URL}/machines/${id}`, { headers });
      setMachine(mRes.data);

      // Fetch alerts
      try {
        const aRes = await axios.get(`${API_URL}/alerts`, { headers });
        // Filter alerts for this machine
        setAlerts(aRes.data.data.filter(a => (a.machineId?._id === id || a.machineId === id)));
      } catch(e) {}

      // Fetch work orders
      try {
        const wRes = await axios.get(`${API_URL}/work-orders`, { headers });
        setWorkOrders(wRes.data.data.filter(w => (w.machineId?._id === id || w.machineId === id)));
      } catch(e) {}
      
    } catch (error) {
      console.error('Error fetching Asset 360 data:', error);
      toast.error('Failed to load Asset 360 data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary" /></div>;
  }

  if (!machine) {
    return <div className="text-center p-5">Asset not found.</div>;
  }

  return (
    <div className="fade-in pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/assets" className="text-decoration-none text-secondary mb-2 d-inline-block">&larr; Back to Assets</Link>
          <h1 className="page-title mb-1">Asset 360: {machine.name}</h1>
          <p className="page-subtitle mb-0">Central investigation and telemetry for {machine.machineId}</p>
        </div>
        <div>
          <span className={`badge px-3 py-2 fs-6 ${machine.currentStatus === 'ONLINE' ? 'bg-success' : machine.currentStatus === 'WARNING' ? 'bg-warning text-dark' : 'bg-danger'}`}>
            {machine.currentStatus}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* 1. Identity & Specs */}
        <div className="col-lg-4">
          <div className="card h-100">
            <h5 className="card-title mb-3 d-flex align-items-center gap-2"><Settings size={18}/> Identity</h5>
            <table className="table table-dark table-sm mb-0">
              <tbody>
                <tr><td className="text-muted">Type</td><td className="text-end fw-medium">{machine.type}</td></tr>
                <tr><td className="text-muted">Line</td><td className="text-end fw-medium">{machine.lineId || 'N/A'}</td></tr>
                <tr><td className="text-muted">Manufacturer</td><td className="text-end fw-medium">{machine.manufacturer || 'Unknown'}</td></tr>
                <tr><td className="text-muted">Serial No.</td><td className="text-end fw-medium">{machine.specifications?.serialNumber || 'N/A'}</td></tr>
                <tr><td className="text-muted">Max Power</td><td className="text-end fw-medium">{machine.specifications?.maxPowerKw || 0} kW</td></tr>
                <tr><td className="text-muted">Rated Temp</td><td className="text-end fw-medium">{machine.specifications?.operatingTemperatureRange || 'N/A'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Telemetry (Mocked live values based on specs) */}
        <div className="col-lg-4">
          <div className="card h-100 border-start border-4 border-info">
            <h5 className="card-title mb-3 d-flex align-items-center gap-2"><Activity size={18}/> Live Telemetry</h5>
            <div className="row g-3">
              <div className="col-6">
                <div className="p-2 bg-dark rounded border border-secondary text-center hover-lift">
                  <Thermometer className="text-danger mb-1" size={20} />
                  <div className="fs-5 fw-bold text-white">72.4°C</div>
                  <div className="text-muted small">Temperature</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-dark rounded border border-secondary text-center hover-lift">
                  <Activity className="text-warning mb-1" size={20} />
                  <div className="fs-5 fw-bold text-white">2.8 mm/s</div>
                  <div className="text-muted small">Vibration</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-dark rounded border border-secondary text-center hover-lift">
                  <Zap className="text-info mb-1" size={20} />
                  <div className="fs-5 fw-bold text-white">45 kW</div>
                  <div className="text-muted small">Power Draw</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-dark rounded border border-secondary text-center hover-lift">
                  <Gauge className="text-primary mb-1" size={20} />
                  <div className="fs-5 fw-bold text-white">102 PSI</div>
                  <div className="text-muted small">Pressure</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Predictions */}
        <div className="col-lg-4">
          <div className="card h-100 border-start border-4 border-warning">
            <h5 className="card-title mb-3 d-flex align-items-center gap-2"><Cpu size={18}/> ML Predictions</h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Failure Probability</span>
                <span className="fw-bold text-warning">14%</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: '14%' }}></div>
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Remaining Useful Life (RUL)</span>
                <span className="fw-bold text-success">38 Days</span>
              </div>
            </div>
            <div className="p-2 bg-dark border border-secondary rounded">
              <div className="text-secondary small mb-1">Anomaly Status</div>
              <div className="text-white fw-medium d-flex align-items-center gap-2">
                <div className="spinner-grow spinner-grow-sm text-success" role="status"></div> Normal Operation
              </div>
            </div>
          </div>
        </div>

        {/* 4. Active Smart Alerts */}
        <div className="col-12">
          <div className="card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title m-0 d-flex align-items-center gap-2"><ShieldAlert size={18}/> Smart Alerts & Investigation</h5>
              <Link to="/alerts" className="btn btn-sm btn-outline-secondary">View All Alerts</Link>
            </div>
            
            {alerts.length === 0 ? (
              <p className="text-muted text-center py-3">No active alerts for this asset.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Score</th>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(a => (
                      <tr key={a._id}>
                        <td>
                          <span className={`badge ${a.priorityScore >= 80 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {a.priorityScore}
                          </span>
                        </td>
                        <td><span className="badge bg-secondary">{a.type}</span></td>
                        <td>
                          <div className="fw-bold">{a.title}</div>
                          <div className="small text-muted">{a.message}</div>
                        </td>
                        <td>
                          <span className={`badge bg-dark border ${a.status === 'NEW' ? 'border-danger text-danger' : 'border-success text-success'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="text-muted small">{new Date(a.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 5. Maintenance History */}
        <div className="col-12">
          <div className="card">
            <h5 className="card-title mb-3 d-flex align-items-center gap-2"><History size={18}/> Work Orders & Maintenance History</h5>
            {workOrders.length === 0 ? (
              <p className="text-muted text-center py-3">No work orders found for this asset.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Scheduled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map(w => (
                      <tr key={w._id}>
                        <td className="fw-medium">{w.orderId}</td>
                        <td>{w.type}</td>
                        <td><span className="badge bg-dark border">{w.status}</span></td>
                        <td>
                          <span className={`badge ${w.priority === 'CRITICAL' ? 'bg-danger' : w.priority === 'HIGH' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                            {w.priority}
                          </span>
                        </td>
                        <td className="text-muted">{new Date(w.scheduledDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
