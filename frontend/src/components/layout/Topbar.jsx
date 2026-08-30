import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import './layout.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn d-lg-none">
          <Menu size={24} />
        </button>
      </div>
      
      <div className="topbar-right">
        <div className="topbar-action">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="badge-indicator"></span>
          </button>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Plant Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
