const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const memoryStore = require('../dbMemoryStore');

    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryStore.getCounts());
    }

    const [students, teachers, subjects, attendance] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Subject.countDocuments(),
      Attendance.countDocuments(),
    ]);
    res.json({ students, teachers, subjects, attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
