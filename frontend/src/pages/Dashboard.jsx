import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Factory } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [liveData, setLiveData] = useState([]);
  const [currentKPIs, setCurrentKPIs] = useState({
    activeMachines: 0,
    avgOEE: 0,
    totalEnergy: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the socket server
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('factory-live-updates', (data) => {
      // data is an array of machine updates emitted every 3 seconds
      if (!data || data.length === 0) return;

      const activeCount = data.filter(m => m.operatingStatus === 'RUNNING').length;
      const totalOEE = data.reduce((acc, curr) => acc + parseFloat(curr.derivedMetrics.OEE), 0);
      const energySum = data.reduce((acc, curr) => acc + parseFloat(curr.energyConsumption), 0);
      
      const avgOEE = totalOEE / data.length;

      setCurrentKPIs({
        activeMachines: activeCount,
        avgOEE: (avgOEE * 100).toFixed(1),
        totalEnergy: energySum.toFixed(1)
      });

      // Update chart data (keep last 15 points to simulate a moving window)
      setLiveData(prev => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' });
        const newPoint = {
          time: now,
          energy: energySum.toFixed(1),
          oee: (avgOEE * 100).toFixed(1)
        };
        const updated = [...prev, newPoint];
        if (updated.length > 15) return updated.slice(updated.length - 15);
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Plant Overview</h1>
          <p>Live metrics from the factory floor.</p>
        </div>
        <div>
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-warning'}`}>
            {isConnected ? '🟢 Live Connection' : '🔴 Disconnected'}
          </span>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card card-primary" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%' }}>
            <Activity size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Average OEE</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {currentKPIs.avgOEE}%
            </div>
          </div>
        </div>

        <div className="card card-secondary" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--secondary)', color: 'white', borderRadius: '50%' }}>
            <Factory size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Machines</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {currentKPIs.activeMachines}
            </div>
          </div>
        </div>

        <div className="card card-energy" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--energy)', color: 'white', borderRadius: '50%' }}>
            <Zap size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Live Energy (kWh)</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {currentKPIs.totalEnergy}
            </div>
          </div>
        </div>
      </div>

      {/* Live Chart */}
      <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1rem' }}>Live Factory Energy & Performance</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--energy)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--energy)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="var(--energy)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--primary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="energy" stroke="var(--energy)" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" name="Energy (kWh)" />
              <Area yAxisId="right" type="monotone" dataKey="oee" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorOee)" name="OEE (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
