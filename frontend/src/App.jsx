import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
      {currentTab === 'students' && <Students />}
      {currentTab === 'teachers' && <Teachers />}
      {currentTab === 'subjects' && <Subjects />}
      {currentTab === 'attendance_records' && <Attendance key="records" initialTab="records" />}
      {currentTab === 'attendance_summary' && <Attendance key="summary" initialTab="summary" />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
