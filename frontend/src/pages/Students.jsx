import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  Filter
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ studentName: '', rollNumber: '', course: 'MCA', semester: 1 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingStudent, setDeletingStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [courseFilter, semesterFilter]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = '?';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (courseFilter) query += `course=${encodeURIComponent(courseFilter)}&`;
      if (semesterFilter) query += `semester=${encodeURIComponent(semesterFilter)}&`;

      const data = await api.get(`/students${query}`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ studentName: '', rollNumber: '', course: 'MCA', semester: 1 });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      course: student.course,
      semester: student.semester,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.studentName.trim() || !formData.rollNumber.trim() || !formData.course.trim()) {
      setFormError('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await api.delete(`/students/${deletingStudent._id}`);
      setDeletingStudent(null);
      loadStudents();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '1.4rem' }}>Student Management</h2>
          <p className="card-subtitle">Manage student enrollment, roll codes, and academic cohorts</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '130px' }}
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="MCA">MCA</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BCA">BCA</option>
              <option value="M.Tech">M.Tech</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '130px' }}
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>

            <button type="submit" className="btn btn-secondary">
              <Filter size={15} />
              <span>Apply</span>
            </button>
          </div>
        </form>
      </div>

      {/* Students Data Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <GraduationCap className="empty-state-icon" size={36} />
            <h4 style={{ marginBottom: '0.25rem', color: 'var(--slate-800)' }}>No students found</h4>
            <p>Try clearing filters or register a new student to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <code style={{
                        background: 'var(--slate-100)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        color: 'var(--primary-700)'
                      }}>
                        {student.rollNumber}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                      {student.studentName}
                    </td>
                    <td>
                      <span className="badge badge-course">{student.course}</span>
                    </td>
                    <td>Semester {student.semester}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEditModal(student)}
                          title="Edit Student"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingStudent(student)}
                          title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
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
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Kumar"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MCA001"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Course *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. MCA"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester *</label>
                    <select
                      className="form-control"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
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
                  <span>{submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="modal-overlay" onClick={() => setDeletingStudent(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--rose-600)' }}>Confirm Deletion</h3>
              <button
                className="btn-icon-only"
                onClick={() => setDeletingStudent(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
                Are you sure you want to delete student <strong>{deletingStudent.studentName}</strong> (Roll: {deletingStudent.rollNumber})?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--rose-600)' }}>
                ⚠️ This will also delete all attendance records associated with this student.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingStudent(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
