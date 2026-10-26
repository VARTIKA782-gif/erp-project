import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ currentTab, setCurrentTab, children }) {
  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="main-content">
        <Navbar currentTab={currentTab} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
