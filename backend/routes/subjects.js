const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const memoryStore = require('../dbMemoryStore');

// GET /api/subjects - List all subjects with assigned teacher
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryStore.getSubjects(req.query.search));
    }

    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.subjectName = { $regex: search, $options: 'i' };
    }

    const subjects = await Subject.find(filter)
      .populate('teacherId', 'teacherName qualification subjectTaught')
      .sort({ subjectName: 1 });

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects.', error: err.message });
  }
});

// GET /api/subjects/:id - Get single subject
router.get('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const subject = memoryStore.getSubjects().find(s => s._id === req.params.id);
      if (!subject) return res.status(404).json({ message: 'Subject not found.' });
      return res.json(subject);
    }

    const subject = await Subject.findById(req.params.id)
      .populate('teacherId', 'teacherName qualification subjectTaught');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subject.', error: err.message });
  }
});

// POST /api/subjects - Create subject
router.post('/', auth, async (req, res) => {
  try {
    const { subjectName, teacherId } = req.body;

    if (!subjectName) {
      return res.status(400).json({ message: 'Subject name is required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const created = memoryStore.createSubject({ subjectName, teacherId });
      return res.status(201).json(created);
    }

    const subject = new Subject({
      subjectName: subjectName.trim(),
      teacherId: teacherId && teacherId !== '' ? teacherId : null,
    });

    const saved = await subject.save();
    const populated = await Subject.findById(saved._id)
      .populate('teacherId', 'teacherName qualification subjectTaught');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subject.', error: err.message });
  }
});

// PUT /api/subjects/:id - Update subject
router.put('/:id', auth, async (req, res) => {
  try {
    const { subjectName, teacherId } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const updated = memoryStore.updateSubject(req.params.id, { subjectName, teacherId });
      return res.json(updated);
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    if (subjectName) subject.subjectName = subjectName.trim();
    subject.teacherId = teacherId && teacherId !== '' ? teacherId : null;

    await subject.save();
    const populated = await Subject.findById(subject._id)
      .populate('teacherId', 'teacherName qualification subjectTaught');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update subject.', error: err.message });
  }
});

// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      memoryStore.deleteSubject(req.params.id);
      return res.json({ message: 'Subject deleted.', subjectId: req.params.id });
    }

    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    await Attendance.deleteMany({ subjectId: req.params.id });
    res.json({ message: 'Subject and associated attendance records deleted.', subjectId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete subject.', error: err.message });
  }
});

module.exports = router;
