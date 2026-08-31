import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Zap, ShieldAlert, Target, Box, 
  GitBranch, Wrench, Package, Bell, Map, Calculator, 
  BrainCircuit, Leaf, Database, Cpu, FileText, History, 
  Users, ActivitySquare, Settings 
} from 'lucide-react';
import './layout.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Plant Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Production & KPIs', path: '/production', icon: <Activity size={20} /> },
    { name: 'Energy Intelligence', path: '/energy', icon: <Zap size={20} /> },
    { name: 'Predictive Maint.', path: '/maintenance', icon: <ShieldAlert size={20} /> },
    { name: 'Quality Intelligence', path: '/quality', icon: <Target size={20} /> },
    { name: 'Assets', path: '/assets', icon: <Box size={20} /> },
    { name: 'Production Lines', path: '/lines', icon: <GitBranch size={20} /> },
    { name: 'Work Orders', path: '/work-orders', icon: <Wrench size={20} /> },
    { name: 'Spare Parts', path: '/parts', icon: <Package size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell size={20} /> },
    { name: 'Digital Twin', path: '/digital-twin', icon: <Map size={20} /> },
    { name: 'What-If Simulator', path: '/simulator', icon: <Calculator size={20} /> },
    { name: 'AI Ops Copilot', path: '/ai-assistant', icon: <BrainCircuit size={20} /> },
    { name: 'Sustainability', path: '/sustainability', icon: <Leaf size={20} /> },
    { name: 'Data & Integrations', path: '/data', icon: <Database size={20} /> },
    { name: 'ML Operations', path: '/mlops', icon: <Cpu size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Audit Logs', path: '/audit', icon: <History size={20} /> },
    { name: 'User Management', path: '/users', icon: <Users size={20} /> },
    { name: 'Platform Health', path: '/health', icon: <ActivitySquare size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">BN</div>
          <h2>BuildNexus</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <div className="nav-icon" style={{ color: 'var(--text-muted)' }}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer" style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
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
