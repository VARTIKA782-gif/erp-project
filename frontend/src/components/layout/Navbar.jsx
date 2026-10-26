import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Executive Dashboard',
  students: 'Student Directory & Admissions',
  teachers: 'Faculty & Instructor Directory',
  subjects: 'Course & Subject Management',
  attendance_records: 'Daily Attendance Logs',
  attendance_summary: 'Attendance % Summary & Performance',
};

export default function Navbar({ currentTab }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="page-breadcrumb">
        <span>AcademiaERP</span>
        <ChevronRight size={15} />
        <h1 className="page-title-badge">{PAGE_TITLES[currentTab] || 'Overview'}</h1>
      </div>

      <div className="topbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Calendar size={15} />
          <span>{today}</span>
        </div>

        <div className="system-status-indicator">
          <span className="status-dot"></span>
          <span>System Active</span>
        </div>
      </div>
    </header>
  );
}
