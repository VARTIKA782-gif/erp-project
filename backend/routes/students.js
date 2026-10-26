const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const memoryStore = require('../dbMemoryStore');

// GET /api/students - List all students (with optional search and filters)
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryStore.getStudents(req.query));
    }

    const { search, course, semester } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (semester) filter.semester = Number(semester);
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).sort({ studentName: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students.', error: err.message });
  }
});

// GET /api/students/:id - Get single student
router.get('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const student = memoryStore.getStudents().find(s => s._id === req.params.id);
      if (!student) return res.status(404).json({ message: 'Student not found.' });
      return res.json(student);
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student.', error: err.message });
  }
});

// POST /api/students - Create a new student
router.post('/', auth, async (req, res) => {
  try {
    const { studentName, rollNumber, course, semester } = req.body;

    if (!studentName || !rollNumber || !course || !semester) {
      return res.status(400).json({ message: 'All fields are required (studentName, rollNumber, course, semester).' });
    }

    if (mongoose.connection.readyState !== 1) {
      const created = memoryStore.createStudent({ studentName, rollNumber, course, semester });
      return res.status(201).json(created);
    }

    const existing = await Student.findOne({ rollNumber: rollNumber.trim() });
    if (existing) {
      return res.status(400).json({ message: `Roll number '${rollNumber}' is already registered.` });
    }

    const student = new Student({
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim(),
      course: course.trim(),
      semester: Number(semester),
    });

    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create student.' });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', auth, async (req, res) => {
  try {
    const { studentName, rollNumber, course, semester } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const updated = memoryStore.updateStudent(req.params.id, { studentName, rollNumber, course, semester });
      return res.json(updated);
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (rollNumber && rollNumber.trim() !== student.rollNumber) {
      const duplicate = await Student.findOne({
        rollNumber: rollNumber.trim(),
        _id: { $ne: req.params.id }
      });
      if (duplicate) {
        return res.status(400).json({ message: `Roll number '${rollNumber}' is already in use by another student.` });
      }
      student.rollNumber = rollNumber.trim();
    }

    if (studentName) student.studentName = studentName.trim();
    if (course) student.course = course.trim();
    if (semester !== undefined) student.semester = Number(semester);

    const updated = await student.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update student.' });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      memoryStore.deleteStudent(req.params.id);
      return res.json({ message: 'Student deleted successfully.', studentId: req.params.id });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    await Attendance.deleteMany({ studentId: req.params.id });
    res.json({ message: 'Student and associated attendance records deleted successfully.', studentId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete student.', error: err.message });
  }
});

module.exports = router;
