import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import our newly separated components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GoalSheet from './pages/GoalSheet';
import CheckIns from './pages/CheckIns';
import Analytics from './pages/Analytics';
import AdminControl from './pages/AdminControl';

const App = () => {
  // We keep the role state here so it persists as the user navigates between pages
  const [currentRole, setCurrentRole] = useState('Employee');

  return (
    <BrowserRouter>
      {/* The premium grid background wrapper */}
      <div className="min-h-screen premium-grid-bg font-sans">
        
        {/* Pass the state to the Navbar so the Role Switcher works everywhere */}
        <Navbar currentRole={currentRole} setCurrentRole={setCurrentRole} />
        
        <main>
         <Routes>
            {/* Page 1: Dashboard */}
            <Route path="/" element={<Dashboard currentRole={currentRole} />} />
            
            {/* Page 2: Goal Sheet Validation Matrix */}
            <Route path="/goals" element={<GoalSheet currentRole={currentRole} />} />
            
            {/* Page 3: Check-ins & Actuals Logging */}
            <Route path="/check-ins" element={<CheckIns currentRole={currentRole} />} />
            
            {/* Page 4: Admin Governance Hub */}
            <Route path="/admin" element={<AdminControl currentRole={currentRole} />} />
            
            {/* Page 5: Executive Analytics & Escalations */}
            <Route path="/analytics" element={<Analytics currentRole={currentRole} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;