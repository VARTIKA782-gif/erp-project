import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  Award,
  BookOpen
} from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ teacherName: '', qualification: '', experience: '', subjectTaught: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingTeacher, setDeletingTeacher] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await api.get(`/teachers${query}`);
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTeachers();
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ teacherName: '', qualification: '', experience: '5 Years', subjectTaught: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      teacherName: teacher.teacherName,
      qualification: teacher.qualification,
      experience: teacher.experience || '5 Years',
      subjectTaught: teacher.subjectTaught
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.teacherName.trim() || !formData.qualification.trim() || !formData.subjectTaught.trim()) {
      setFormError('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher._id}`, formData);
      } else {
        await api.post('/teachers', formData);
      }
      setModalOpen(false);
      loadTeachers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTeacher) return;
    try {
      await api.delete(`/teachers/${deletingTeacher._id}`);
      setDeletingTeacher(null);
      loadTeachers();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '1.4rem' }}>Faculty & Teacher Management</h2>
          <p className="card-subtitle">Manage professors, instructors, academic credentials, and teaching domains</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add New Teacher</span>
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
              placeholder="Search faculty by name, qualification, or subject taught..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Teachers Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-state-icon" size={36} />
            <h4 style={{ marginBottom: '0.25rem', color: 'var(--slate-800)' }}>No faculty members found</h4>
            <p>Add a new instructor to assign them to academic subjects.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Primary Subject Domain</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--emerald-50)',
                          color: 'var(--emerald-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {teacher.teacherName.charAt(0)}
                        </div>
                        <span>{teacher.teacherName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-700)' }}>
                        <Award size={15} color="var(--amber-500)" />
                        <span>{teacher.qualification}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{teacher.experience || '5 Years'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BookOpen size={15} color="var(--primary-500)" />
                        <span style={{ fontWeight: 500 }}>{teacher.subjectTaught}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEditModal(teacher)}
                          title="Edit Teacher"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingTeacher(teacher)}
                          title="Delete Teacher"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
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

      {/* Add / Edit Teacher Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTeacher ? 'Edit Faculty Details' : 'Register New Faculty'}
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
                  <label className="form-label">Teacher Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Anjali Sharma"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ph.D Computer Science / M.Tech"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5 Years / 8+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Taught / Expertise *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Data Structures & Algorithms"
                    value={formData.subjectTaught}
                    onChange={(e) => setFormData({ ...formData, subjectTaught: e.target.value })}
                    required
                  />
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
                  <span>{submitting ? 'Saving...' : editingTeacher ? 'Update Faculty' : 'Save Faculty'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeacher && (
        <div className="modal-overlay" onClick={() => setDeletingTeacher(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--rose-600)' }}>Confirm Deletion</h3>
              <button
                className="btn-icon-only"
                onClick={() => setDeletingTeacher(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
                Are you sure you want to delete <strong>{deletingTeacher.teacherName}</strong>?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ℹ️ Any subjects currently assigned to this teacher will automatically be set to unassigned.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingTeacher(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
