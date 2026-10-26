require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the backend environment.');
}

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const subjectRoutes = require('./routes/subjects');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_academic_db';

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected (MongoDB)' : 'active (In-Memory Pre-Seeded Store)',
    mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'memory',
    timestamp: new Date()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server immediately
app.listen(PORT, () => {
  console.log(`🚀 ERP Academic Admin Backend running on http://localhost:${PORT}`);
});

// Connect to MongoDB in background
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log(`✅ Connected to MongoDB at: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.log('ℹ️ Running in fast In-Memory fallback mode (MongoDB not connected).');
  });
