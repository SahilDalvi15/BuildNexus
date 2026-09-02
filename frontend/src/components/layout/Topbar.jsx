import React, { useContext } from 'react';
import { Bell, User, Menu, MapPin } from 'lucide-react';
import { PlantContext } from '../../context/PlantContext';
import './layout.css';

const Topbar = () => {
  const { plants, activePlant, changeActivePlant } = useContext(PlantContext);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn d-lg-none">
          <Menu size={24} />
        </button>
        
        {activePlant && (
          <div className="plant-selector">
            <MapPin size={18} className="text-secondary" style={{ marginRight: '8px' }} />
            <select 
              value={activePlant._id} 
              onChange={(e) => changeActivePlant(e.target.value)}
              className="plant-select-dropdown"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {plants.map(plant => (
                <option key={plant._id} value={plant._id} style={{background: '#1a1d2d'}}>
                  {plant.name} ({plant.plantId})
                </option>
              ))}
            </select>
          </div>
        )}
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
