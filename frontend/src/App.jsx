import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlantProvider } from './context/PlantContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Energy from './pages/Energy';
import Quality from './pages/Quality';
import Maintenance from './pages/Maintenance';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Placeholder
import Placeholder from './pages/Placeholder';

// V3 Pages
import Assets from './pages/Assets';
import Lines from './pages/Lines';
import Sustainability from './pages/Sustainability';
import WorkOrders from './pages/WorkOrders';
import SpareParts from './pages/SpareParts';

function App() {
  return (
    <AuthProvider>
      <PlantProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="production" element={<Production />} />
              <Route path="energy" element={<Energy />} />
              <Route path="quality" element={<Quality />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="settings" element={<Settings />} />
              
              {/* V3 Routes */}
              <Route path="assets" element={<Assets />} />
              <Route path="lines" element={<Lines />} />
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="parts" element={<SpareParts />} />
              <Route path="alerts" element={<Placeholder title="Alerts & Notifications" />} />
              <Route path="digital-twin" element={<Placeholder title="Digital Twin" />} />
              <Route path="simulator" element={<Placeholder title="What-If Simulator" />} />
              <Route path="sustainability" element={<Sustainability />} />
              <Route path="data" element={<Placeholder title="Data & Integrations" />} />
              <Route path="mlops" element={<Placeholder title="ML Operations" />} />
              <Route path="reports" element={<Placeholder title="Reports" />} />
              <Route path="audit" element={<Placeholder title="Audit Logs" />} />
              <Route path="users" element={<Placeholder title="User Management" />} />
              <Route path="health" element={<Placeholder title="Platform Health" />} />
            </Route>
          </Routes>
        </Router>
      </PlantProvider>
    </AuthProvider>
  );
}

export default App;
