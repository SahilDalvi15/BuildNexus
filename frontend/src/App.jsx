import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <AuthProvider>
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
            
            {/* V3 Placeholder Routes */}
            <Route path="assets" element={<Placeholder title="Assets Management" />} />
            <Route path="lines" element={<Placeholder title="Production Lines" />} />
            <Route path="work-orders" element={<Placeholder title="Work Orders" />} />
            <Route path="parts" element={<Placeholder title="Spare Parts" />} />
            <Route path="alerts" element={<Placeholder title="Alerts & Notifications" />} />
            <Route path="digital-twin" element={<Placeholder title="Digital Twin" />} />
            <Route path="simulator" element={<Placeholder title="What-If Simulator" />} />
            <Route path="sustainability" element={<Placeholder title="Sustainability & CO2" />} />
            <Route path="data" element={<Placeholder title="Data & Integrations" />} />
            <Route path="mlops" element={<Placeholder title="ML Operations" />} />
            <Route path="reports" element={<Placeholder title="Reports" />} />
            <Route path="audit" element={<Placeholder title="Audit Logs" />} />
            <Route path="users" element={<Placeholder title="User Management" />} />
            <Route path="health" element={<Placeholder title="Platform Health" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
