import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  UserCheck,
  UserX
} from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ subjectName: '', teacherId: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingSubject, setDeletingSubject] = useState(null);

  useEffect(() => {
    loadSubjectsAndTeachers();
  }, []);

  const loadSubjectsAndTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const [subsData, teachersData] = await Promise.all([
        api.get(`/subjects${query}`),
        api.get('/teachers'),
      ]);

      setSubjects(Array.isArray(subsData) ? subsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSubjectsAndTeachers();
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ subjectName: '', teacherId: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subjectName: subject.subjectName,
      teacherId: subject.teacherId?._id || subject.teacherId || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.subjectName.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      setModalOpen(false);
      loadSubjectsAndTeachers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;
    try {
      await api.delete(`/subjects/${deletingSubject._id}`);
      setDeletingSubject(null);
      loadSubjectsAndTeachers();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '1.4rem' }}>Curriculum & Subjects</h2>
          <p className="card-subtitle">Manage curriculum courses and assign dedicated faculty teachers</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add New Subject</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search subjects by course name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Subjects Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-state-icon" size={36} />
            <h4 style={{ marginBottom: '0.25rem', color: 'var(--slate-800)' }}>No academic subjects found</h4>
            <p>Create a new subject and assign a faculty member to it.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Assigned Faculty Member</th>
                  <th>Department / Qualification</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => {
                  const teacher = sub.teacherId;
                  return (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <BookOpen size={16} color="var(--primary-600)" />
                          <span>{sub.subjectName}</span>
                        </div>
                      </td>
                      <td>
                        {teacher ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserCheck size={16} color="var(--emerald-600)" />
                            <span style={{ fontWeight: 600 }}>{teacher.teacherName}</span>
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--slate-400)',
                            fontStyle: 'italic',
                            fontSize: '0.85rem'
                          }}>
                            <UserX size={14} /> Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        {teacher?.qualification ? (
                          <span style={{ color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                            {teacher.qualification}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditModal(sub)}
                            title="Edit Subject"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeletingSubject(sub)}
                            title="Delete Subject"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingSubject ? 'Edit Subject Details' : 'Create New Subject'}
              </h3>
              <button
                className="btn-icon-only"
                onClick={() => setModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Data Structures & Algorithms"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Faculty Teacher</label>
                  <select
                    className="form-control"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  >
                    <option value="">-- Select Teacher (Optional) --</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.teacherName} ({t.qualification})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <Check size={16} />
                  <span>{submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubject && (
        <div className="modal-overlay" onClick={() => setDeletingSubject(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--rose-600)' }}>Confirm Deletion</h3>
              <button
                className="btn-icon-only"
                onClick={() => setDeletingSubject(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
                Are you sure you want to delete subject <strong>{deletingSubject.subjectName}</strong>?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--rose-600)' }}>
                ⚠️ This will also delete all attendance records logged under this subject.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingSubject(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
