import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Activity, BrainCircuit, ShieldAlert, Settings, Target } from 'lucide-react';
import './layout.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Plant Overview', path: '/', icon: <LayoutDashboard size={20} />, color: 'var(--primary)' },
    { name: 'Production & KPIs', path: '/production', icon: <Activity size={20} />, color: 'var(--secondary)' },
    { name: 'Quality Control', path: '/quality', icon: <Target size={20} />, color: 'var(--success)' },
    { name: 'Energy Intelligence', path: '/energy', icon: <Zap size={20} />, color: 'var(--energy)' },
    { name: 'Predictive Maint.', path: '/maintenance', icon: <ShieldAlert size={20} />, color: 'var(--ai)' },
    { name: 'AI Assistant', path: '/ai-assistant', icon: <BrainCircuit size={20} />, color: 'var(--ai)' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">BN</div>
          <h2>BuildNexus</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <div className="nav-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <div className="nav-icon" style={{ color: 'var(--text-muted)' }}>
            <Settings size={20} />
          </div>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
