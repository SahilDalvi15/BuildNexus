import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Energy from './pages/Energy';
import Maintenance from './pages/Maintenance';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="production" element={<Production />} />
          <Route path="energy" element={<Energy />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
