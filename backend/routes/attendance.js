const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const memoryStore = require('../dbMemoryStore');

// GET /api/attendance/summary - % Summary per student per subject
router.get('/summary', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryStore.getAttendanceSummary(req.query));
    }

    const { studentId, subjectId } = req.query;
    const match = {};

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      match.studentId = new mongoose.Types.ObjectId(studentId);
    }
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      match.subjectId = new mongoose.Types.ObjectId(subjectId);
    }

    const summary = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            studentId: '$studentId',
            subjectId: '$subjectId',
          },
          totalClasses: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id.studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id.subjectId',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$student' },
      { $unwind: '$subject' },
      {
        $project: {
          _id: 0,
          studentId: '$_id.studentId',
          studentName: '$student.studentName',
          rollNumber: '$student.rollNumber',
          course: '$student.course',
          semester: '$student.semester',
          subjectId: '$_id.subjectId',
          subjectName: '$subject.subjectName',
          totalClasses: 1,
          presentCount: 1,
          absentCount: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$presentCount', { $cond: [{ $eq: ['$totalClasses', 0] }, 1, '$totalClasses'] }] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      {
        $sort: { studentName: 1, subjectName: 1 }
      }
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate attendance summary.', error: err.message });
  }
});

// GET /api/attendance - List individual attendance records with filters
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryStore.getAttendance(req.query));
    }

    const { studentId, subjectId, date, status } = req.query;
    const filter = {};

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      filter.studentId = studentId;
    }
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      filter.subjectId = subjectId;
    }
    if (status) {
      filter.status = status;
    }
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.attendanceDate = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'studentName rollNumber course semester')
      .populate('subjectId', 'subjectName')
      .sort({ attendanceDate: -1, createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance records.', error: err.message });
  }
});

// POST /api/attendance - Add single attendance record or bulk
router.post('/', auth, async (req, res) => {
  try {
    const { records, studentId, subjectId, attendanceDate, status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.createAttendance(req.body);
      return res.status(201).json(result);
    }

    // Support bulk insertion for an entire class roster
    if (Array.isArray(records) && records.length > 0) {
      const docs = records.map(r => ({
        studentId: r.studentId,
        subjectId: r.subjectId,
        attendanceDate: new Date(r.attendanceDate || Date.now()),
        status: r.status === 'Absent' ? 'Absent' : 'Present'
      }));
      const created = await Attendance.insertMany(docs);
      return res.status(201).json({ message: `Successfully recorded ${created.length} attendance entries.`, count: created.length });
    }

    // Single record insertion
    if (!studentId || !subjectId || !attendanceDate) {
      return res.status(400).json({ message: 'studentId, subjectId, and attendanceDate are required.' });
    }

    const attendance = new Attendance({
      studentId,
      subjectId,
      attendanceDate: new Date(attendanceDate),
      status: status === 'Absent' ? 'Absent' : 'Present',
    });

    const saved = await attendance.save();
    const populated = await Attendance.findById(saved._id)
      .populate('studentId', 'studentName rollNumber course semester')
      .populate('subjectId', 'subjectName');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record attendance.', error: err.message });
  }
});

// PUT /api/attendance/:id - Update status or date
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, attendanceDate } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const updated = memoryStore.updateAttendance(req.params.id, { status, attendanceDate });
      return res.json(updated);
    }

    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    if (status) record.status = status;
    if (attendanceDate) record.attendanceDate = new Date(attendanceDate);

    await record.save();
    const populated = await Attendance.findById(record._id)
      .populate('studentId', 'studentName rollNumber course semester')
      .populate('subjectId', 'subjectName');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update attendance record.', error: err.message });
  }
});

// DELETE /api/attendance/:id - Delete record
router.delete('/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      memoryStore.deleteAttendance(req.params.id);
      return res.json({ message: 'Attendance record deleted.', id: req.params.id });
    }

    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }
    res.json({ message: 'Attendance record deleted.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete attendance record.', error: err.message });
  }
});

module.exports = router;
