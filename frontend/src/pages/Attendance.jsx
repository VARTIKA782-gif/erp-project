import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  CalendarCheck,
  BarChart3,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  Calendar,
  
  Layers,
  Printer
} from 'lucide-react';

export default function Attendance({ initialTab = 'records' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'records' | 'summary'

  // Common Lookup Data
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // --- Records Tab State ---
  const [records, setRecords] = useState([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Add / Edit Record Modal State
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({
    studentId: '',
    subjectId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    status: 'Present',
  });
  const [recordFormError, setRecordFormError] = useState('');
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Bulk Class Roll-Call Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubjectId, setBulkSubjectId] = useState('');
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkRoster, setBulkRoster] = useState({});
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // --- Summary Tab State ---
  const [summaryData, setSummaryData] = useState([]);
  const [summaryStudent, setSummaryStudent] = useState('');
  const [summarySubject, setSummarySubject] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (activeTab === 'records') {
      loadRecords();
    } else {
      loadSummary();
    }
  }, [activeTab, filterStudent, filterSubject, filterDate, filterStatus, summaryStudent, summarySubject]);

  const loadLookups = async () => {
    try {
      const [stuRes, subRes] = await Promise.all([
        api.get('/students'),
        api.get('/subjects'),
      ]);
      setStudents(Array.isArray(stuRes) ? stuRes : []);
      setSubjects(Array.isArray(subRes) ? subRes : []);
    } catch (err) {
      console.error('Failed to load students and subjects:', err);
    }
  };

  const loadRecords = async () => {
    setLoadingRecords(true);
    try {
      let q = '?';
      if (filterStudent) q += `studentId=${filterStudent}&`;
      if (filterSubject) q += `subjectId=${filterSubject}&`;
      if (filterDate) q += `date=${filterDate}&`;
      if (filterStatus) q += `status=${filterStatus}&`;

      const data = await api.get(`/attendance${q}`);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      let q = '?';
      if (summaryStudent) q += `studentId=${summaryStudent}&`;
      if (summarySubject) q += `subjectId=${summarySubject}&`;

      const data = await api.get(`/attendance/summary${q}`);
      setSummaryData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load attendance summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Helper: Percentage Class (Matches PHP standard: Green >= 75%, Orange 50-74%, Red < 50%)
  const getPctClass = (pct) => {
    if (pct >= 75) return 'pct-good';
    if (pct >= 50) return 'pct-warn';
    return 'pct-bad';
  };

  const getPctLabel = (pct) => {
    if (pct >= 75) return 'Good (≥75%)';
    if (pct >= 50) return 'Warning (50-74%)';
    return 'Critical (<50%)';
  };

  // Single Record Form Handlers
  const openAddRecord = () => {
    setEditingRecord(null);
    setRecordForm({
      studentId: students[0]?._id || '',
      subjectId: subjects[0]?._id || '',
      attendanceDate: new Date().toISOString().split('T')[0],
      status: 'Present',
    });
    setRecordFormError('');
    setRecordModalOpen(true);
  };

  const openEditRecord = (rec) => {
    setEditingRecord(rec);
    setRecordForm({
      studentId: rec.studentId?._id || rec.studentId || '',
      subjectId: rec.subjectId?._id || rec.subjectId || '',
      attendanceDate: rec.attendanceDate ? rec.attendanceDate.split('T')[0] : '',
      status: rec.status,
    });
    setRecordFormError('');
    setRecordModalOpen(true);
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setRecordFormError('');

    if (!recordForm.studentId || !recordForm.subjectId || !recordForm.attendanceDate) {
      setRecordFormError('Please fill out all required fields.');
      return;
    }

    setSubmittingRecord(true);
    try {
      if (editingRecord) {
        await api.put(`/attendance/${editingRecord._id}`, recordForm);
      } else {
        await api.post('/attendance', recordForm);
      }
      setRecordModalOpen(false);
      loadRecords();
    } catch (err) {
      setRecordFormError(err.message);
    } finally {
      setSubmittingRecord(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return;
    try {
      await api.delete(`/attendance/${deletingRecord._id}`);
      setDeletingRecord(null);
      loadRecords();
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  };

  // Bulk Roster Modal Handlers
  const openBulkModal = () => {
    const initialMap = {};
    students.forEach((s) => {
      initialMap[s._id] = 'Present';
    });
    setBulkRoster(initialMap);
    setBulkSubjectId(subjects[0]?._id || '');
    setBulkDate(new Date().toISOString().split('T')[0]);
    setBulkError('');
    setBulkModalOpen(true);
  };

  const handleToggleStudentStatus = (studentId) => {
    setBulkRoster((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setBulkRoster(updated);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');

    if (!bulkSubjectId) {
      setBulkError('Please select a subject for the roll call.');
      return;
    }

    const recordsToInsert = students.map((s) => ({
      studentId: s._id,
      subjectId: bulkSubjectId,
      attendanceDate: bulkDate,
      status: bulkRoster[s._id] || 'Present',
    }));

    setSubmittingBulk(true);
    try {
      await api.post('/attendance', { records: recordsToInsert });
      setBulkModalOpen(false);
      loadRecords();
      if (activeTab === 'summary') loadSummary();
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setSubmittingBulk(false);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '1.4rem' }}>Attendance Administration</h2>
          <p className="card-subtitle">Log roll calls and analyze individual and cohort compliance percentages</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={openBulkModal}>
            <Layers size={17} />
            <span>Class Roll-Call (Batch)</span>
          </button>
          <button className="btn btn-primary" onClick={openAddRecord}>
            <Plus size={17} />
            <span>Single Entry</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <CalendarCheck size={18} />
          <span>Daily Attendance Logs</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <BarChart3 size={18} />
          <span>Attendance % Summary & Analytics</span>
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE RECORDS */}
      {activeTab === 'records' && (
        <>
          {/* Filter Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div className="filter-bar" style={{ margin: 0 }}>
              <div className="form-group" style={{ margin: 0, minWidth: '180px', flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Student</label>
                <select
                  className="form-control"
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                >
                  <option value="">-- All Students --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '180px', flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Subject</label>
                <select
                  className="form-control"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  <option value="">-- All Subjects --</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, width: 'auto' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0, width: 'auto' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Status</label>
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              {(filterStudent || filterSubject || filterDate || filterStatus) && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: 'flex-end' }}
                  onClick={() => {
                    setFilterStudent('');
                    setFilterSubject('');
                    setFilterDate('');
                    setFilterStatus('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="card">
            {loadingRecords ? (
              <div className="empty-state">Loading attendance records...</div>
            ) : records.length === 0 ? (
              <div className="empty-state">
                <CalendarCheck className="empty-state-icon" size={36} />
                <h4 style={{ marginBottom: '0.25rem', color: 'var(--slate-800)' }}>No attendance entries match</h4>
                <p>Add a new entry or perform a class roll-call.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll Code</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec._id}>
                        <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {rec.studentId?.studentName || '—'}
                        </td>
                        <td>
                          <code>{rec.studentId?.rollNumber || '—'}</code>
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
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => openEditRecord(rec)}
                              title="Edit Entry"
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeletingRecord(rec)}
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: ATTENDANCE SUMMARY & % ANALYTICS */}
      {activeTab === 'summary' && (
        <>
          {/* Color Coding Legend Banner */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.2rem' }}>
                  Standard Academic Attendance Thresholds
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Computed across logged sessions per student per subject
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="pct-badge pct-good">
                  🟢 Good: ≥ 75%
                </span>
                <span className="pct-badge pct-warn">
                  🟠 Warning: 50% – 74%
                </span>
                <span className="pct-badge pct-bad">
                  🔴 Low: &lt; 50%
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar for Summary */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div className="filter-bar" style={{ margin: 0 }}>
              <div className="form-group" style={{ margin: 0, minWidth: '220px', flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Student</label>
                <select
                  className="form-control"
                  value={summaryStudent}
                  onChange={(e) => setSummaryStudent(e.target.value)}
                >
                  <option value="">-- All Students --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '220px', flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Subject</label>
                <select
                  className="form-control"
                  value={summarySubject}
                  onChange={(e) => setSummarySubject(e.target.value)}
                >
                  <option value="">-- All Subjects --</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {(summaryStudent || summarySubject) && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: 'flex-end' }}
                  onClick={() => {
                    setSummaryStudent('');
                    setSummarySubject('');
                  }}
                >
                  Reset
                </button>
              )}

              <button
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Summary Data Table */}
          <div className="card">
            {loadingSummary ? (
              <div className="empty-state">Calculating attendance percentages...</div>
            ) : summaryData.length === 0 ? (
              <div className="empty-state">
                <BarChart3 className="empty-state-icon" size={36} />
                <h4 style={{ marginBottom: '0.25rem', color: 'var(--slate-800)' }}>No attendance summary available</h4>
                <p>Record attendance entries to view computed attendance percentage reports.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Roll Code</th>
                      <th>Course</th>
                      <th>Subject</th>
                      <th>Classes Held</th>
                      <th>Attended</th>
                      <th>Absent</th>
                      <th style={{ minWidth: '150px' }}>Visual Progress</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map((row, index) => {
                      const pct = row.percentage || 0;
                      const badgeClass = getPctClass(pct);
                      return (
                        <tr key={`summary-${index}`}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                            {row.studentName}
                          </td>
                          <td>
                            <code>{row.rollNumber}</code>
                          </td>
                          <td>
                            <span className="badge badge-course">
                              {row.course} (Sem {row.semester})
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{row.subjectName}</td>
                          <td style={{ fontWeight: 700 }}>{row.totalClasses}</td>
                          <td style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>{row.presentCount}</td>
                          <td style={{ color: 'var(--rose-600)', fontWeight: 700 }}>{row.absentCount}</td>
                          <td>
                            <div className="progress-container">
                              <div className="progress-track">
                                <div
                                  className={`progress-fill ${badgeClass}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`pct-badge ${badgeClass}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Single Record Modal (Add / Edit) */}
      {recordModalOpen && (
        <div className="modal-overlay" onClick={() => setRecordModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRecord ? 'Edit Attendance Record' : 'Record Student Attendance'}
              </h3>
              <button
                className="btn-icon-only"
                onClick={() => setRecordModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit}>
              <div className="modal-body">
                {recordFormError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{recordFormError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select
                    className="form-control"
                    value={recordForm.studentId}
                    onChange={(e) => setRecordForm({ ...recordForm, studentId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.studentName} ({s.rollNumber}) — {s.course}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    className="form-control"
                    value={recordForm.subjectId}
                    onChange={(e) => setRecordForm({ ...recordForm, subjectId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={recordForm.attendanceDate}
                      onChange={(e) => setRecordForm({ ...recordForm, attendanceDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attendance Status *</label>
                    <select
                      className="form-control"
                      value={recordForm.status}
                      onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRecordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingRecord}
                >
                  <Check size={16} />
                  <span>{submittingRecord ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Class Roll-Call Modal */}
      {bulkModalOpen && (
        <div className="modal-overlay" onClick={() => setBulkModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Batch Class Roll-Call</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Quickly mark attendance for all students in one session</p>
              </div>
              <button
                className="btn-icon-only"
                onClick={() => setBulkModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {bulkError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{bulkError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subject Course *</label>
                    <select
                      className="form-control"
                      value={bulkSubjectId}
                      onChange={(e) => setBulkSubjectId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Session Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    Student Roster ({students.length} Students)
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleMarkAll('Present')}
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleMarkAll('Absent')}
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {students.map((stu) => {
                    const isPresent = bulkRoster[stu._id] !== 'Absent';
                    return (
                      <div
                        key={stu._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          background: isPresent ? '#f0fdf4' : '#fff1f2',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{stu.studentName}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                            ({stu.rollNumber})
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`btn btn-sm ${isPresent ? 'btn-primary' : 'btn-danger'}`}
                          style={{ minWidth: '95px' }}
                          onClick={() => handleToggleStudentStatus(stu._id)}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 size={14} /> Present
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Absent
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBulkModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingBulk}
                >
                  <Check size={16} />
                  <span>{submittingBulk ? 'Submitting...' : 'Save Class Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation */}
      {deletingRecord && (
        <div className="modal-overlay" onClick={() => setDeletingRecord(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--rose-600)' }}>Delete Record</h3>
              <button
                className="btn-icon-only"
                onClick={() => setDeletingRecord(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this attendance record?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingRecord(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteRecord}>
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
