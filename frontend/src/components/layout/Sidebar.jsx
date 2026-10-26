import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  BarChart3,
  LogOut,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { username, logout } = useAuth();

  const navItems = [
    { section: 'MAIN' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'ACADEMICS' },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { section: 'ATTENDANCE' },
    { id: 'attendance_records', label: 'Daily Records', icon: CalendarCheck },
    { id: 'attendance_summary', label: 'Attendance % Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <Sparkles size={22} />
        </div>
        <div className="logo-text">
          <span className="logo-title">AcademiaERP</span>
          <span className="logo-subtitle">Admin Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={`sec-${idx}`} className="nav-section-label">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">
            {username ? username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-info">
            <div className="user-name">{username || 'Administrator'}</div>
            <div className="user-role">
              <ShieldCheck size={13} />
              <span>Admin Access</span>
            </div>
          </div>
          <button
            className="btn-logout"
            onClick={logout}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
