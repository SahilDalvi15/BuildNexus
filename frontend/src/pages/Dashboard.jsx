import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="header-actions">
        <h1>Plant Overview</h1>
        <p>Live metrics from the factory floor.</p>
      </div>
      
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card card-primary">
          <h3>Overall Equipment Effectiveness (OEE)</h3>
          <p>Loading...</p>
        </div>
        <div className="card card-secondary">
          <h3>Active Machines</h3>
          <p>Loading...</p>
        </div>
        <div className="card card-energy">
          <h3>Total Energy Consumption</h3>
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
