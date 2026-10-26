import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Dashboard({ setCurrentTab }) {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, subjects: 0, attendance: 0 });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, attRes, sumRes] = await Promise.all([
        api.get('/dashboard').catch(() => ({ students: 0, teachers: 0, subjects: 0, attendance: 0 })),
        api.get('/attendance').catch(() => []),
        api.get('/attendance/summary').catch(() => []),
      ]);

      setCounts(dashRes);
      setRecentAttendance(Array.isArray(attRes) ? attRes.slice(0, 6) : []);
      setSummaryData(Array.isArray(sumRes) ? sumRes : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall average attendance percentage
  const totalClassesSum = summaryData.reduce((acc, curr) => acc + (curr.totalClasses || 0), 0);
  const totalPresentSum = summaryData.reduce((acc, curr) => acc + (curr.presentCount || 0), 0);
  const overallPct = totalClassesSum > 0 ? Math.round((totalPresentSum / totalClassesSum) * 1000) / 10 : 0;

  const getPctBadgeClass = (pct) => {
    if (pct >= 75) return 'pct-good';
    if (pct >= 50) return 'pct-warn';
    return 'pct-bad';
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#818cf8',
            marginBottom: '0.5rem'
          }}>
            <TrendingUp size={14} /> Live Campus Analytics
          </span>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Academic Administration Hub
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Real-time management of students, faculty, curriculum, and class attendance metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setCurrentTab('attendance_records')}>
            <PlusCircle size={17} />
            <span>Mark Attendance</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentTab('attendance_summary')}>
            <BarChart3 size={17} />
            <span>Attendance % Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>Failed to load dashboard statistics: {error}</span>
        </div>
      )}

      {/* 4 Live Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#4f46e5', '--stat-bg': '#eef2ff' }}>
          <div className="stat-icon-wrapper">
            <GraduationCap size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '...' : counts.students}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#059669', '--stat-bg': '#ecfdf5' }}>
          <div className="stat-icon-wrapper">
            <Users size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '...' : counts.teachers}</span>
            <span className="stat-label">Active Teachers</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#9333ea', '--stat-bg': '#faf5ff' }}>
          <div className="stat-icon-wrapper">
            <BookOpen size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '...' : counts.subjects}</span>
            <span className="stat-label">Academic Subjects</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#d97706', '--stat-bg': '#fffbeb' }}>
          <div className="stat-icon-wrapper">
            <CalendarCheck size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '...' : counts.attendance}</span>
            <span className="stat-label">Attendance Records</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Attendance Health Gauge & Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Attendance Health Gauge */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Overall Attendance Health</h3>
              <p className="card-subtitle">Aggregate attendance compliance across all cohorts</p>
            </div>
            <span className={`pct-badge ${getPctBadgeClass(overallPct)}`}>
              {overallPct}%
            </span>
          </div>

          <div style={{ margin: '1.25rem 0' }}>
            <div className="progress-track" style={{ height: '14px', borderRadius: 'var(--radius-full)' }}>
              <div
                className={`progress-fill ${getPctBadgeClass(overallPct)}`}
                style={{ width: `${Math.min(overallPct, 100)}%` }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CLASSES HELD</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem' }}>{totalClassesSum}</div>
            </div>
            <div>
              <div style={{ color: 'var(--emerald-600)', fontSize: '0.75rem', fontWeight: 600 }}>PRESENT LOGS</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem', color: 'var(--emerald-700)' }}>{totalPresentSum}</div>
            </div>
            <div>
              <div style={{ color: 'var(--rose-600)', fontSize: '0.75rem', fontWeight: 600 }}>ABSENT LOGS</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem', color: 'var(--rose-700)' }}>
                {totalClassesSum - totalPresentSum}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Quick Administration Actions</h3>
              <p className="card-subtitle">Fast links to common academic administrative tasks</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              onClick={() => setCurrentTab('students')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GraduationCap size={18} color="var(--primary-600)" />
                <span>Add Student</span>
              </div>
              <ArrowUpRight size={15} color="var(--slate-400)" />
            </button>

            <button
              className="btn btn-outline"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              onClick={() => setCurrentTab('teachers')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={18} color="var(--emerald-600)" />
                <span>Add Teacher</span>
              </div>
              <ArrowUpRight size={15} color="var(--slate-400)" />
            </button>

            <button
              className="btn btn-outline"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              onClick={() => setCurrentTab('subjects')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={18} color="var(--purple-600)" />
                <span>Add Subject</span>
              </div>
              <ArrowUpRight size={15} color="var(--slate-400)" />
            </button>

            <button
              className="btn btn-outline"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              onClick={() => setCurrentTab('attendance_summary')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BarChart3 size={18} color="var(--amber-600)" />
                <span>% Summary</span>
              </div>
              <ArrowUpRight size={15} color="var(--slate-400)" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Attendance Activity Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Attendance Activity</h3>
            <p className="card-subtitle">Latest recorded roll call records</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrentTab('attendance_records')}>
            View All Records
          </button>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="empty-state">
            <Clock className="empty-state-icon" size={32} />
            <p>No recent attendance entries recorded yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Course</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((rec) => (
                  <tr key={rec._id}>
                    <td style={{ fontWeight: 600 }}>{rec.studentId?.studentName || '—'}</td>
                    <td><code>{rec.studentId?.rollNumber || '—'}</code></td>
                    <td>
                      <span className="badge badge-course">
                        {rec.studentId?.course || '—'} (Sem {rec.studentId?.semester || '—'})
                      </span>
                    </td>
                    <td>{rec.subjectId?.subjectName || '—'}</td>
                    <td>
                      {rec.attendanceDate
                        ? new Date(rec.attendanceDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td>
                      {rec.status === 'Present' ? (
                        <span className="badge badge-present">
                          <CheckCircle2 size={13} /> Present
                        </span>
                      ) : (
                        <span className="badge badge-absent">
                          <XCircle size={13} /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
