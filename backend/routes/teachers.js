const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const memoryStore = require('../dbMemoryStore');

// GET /api/teachers - List all teachers
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryStore.getTeachers(req.query.search));
    }

    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { teacherName: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } },
        { subjectTaught: { $regex: search, $options: 'i' } },
      ];
    }

    const teachers = await Teacher.find(filter).sort({ teacherName: 1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teachers.', error: err.message });
  }
});

// GET /api/teachers/:id - Get single teacher
router.get('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const teacher = memoryStore.getTeachers().find(t => t._id === req.params.id);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
      return res.json(teacher);
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teacher.', error: err.message });
  }
});

// POST /api/teachers - Create teacher
router.post('/', auth, async (req, res) => {
  try {
    const { teacherName, qualification, subjectTaught } = req.body;

    if (!teacherName || !qualification || !subjectTaught) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const created = memoryStore.createTeacher({ teacherName, qualification, subjectTaught });
      return res.status(201).json(created);
    }

    const teacher = new Teacher({
      teacherName: teacherName.trim(),
      qualification: qualification.trim(),
      subjectTaught: subjectTaught.trim(),
    });

    const saved = await teacher.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create teacher.', error: err.message });
  }
});

// PUT /api/teachers/:id - Update teacher
router.put('/:id', auth, async (req, res) => {
  try {
    const { teacherName, qualification, subjectTaught } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const updated = memoryStore.updateTeacher(req.params.id, { teacherName, qualification, subjectTaught });
      return res.json(updated);
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    if (teacherName) teacher.teacherName = teacherName.trim();
    if (qualification) teacher.qualification = qualification.trim();
    if (subjectTaught) teacher.subjectTaught = subjectTaught.trim();

    const updated = await teacher.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update teacher.', error: err.message });
  }
});

// DELETE /api/teachers/:id - Delete teacher
router.delete('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      memoryStore.deleteTeacher(req.params.id);
      return res.json({ message: 'Teacher deleted and unassigned.', teacherId: req.params.id });
    }

    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    await Subject.updateMany({ teacherId: req.params.id }, { $set: { teacherId: null } });
    res.json({ message: 'Teacher deleted and unassigned from subjects.', teacherId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete teacher.', error: err.message });
  }
});

module.exports = router;
