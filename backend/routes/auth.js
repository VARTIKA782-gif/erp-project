const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const mongoose = require('mongoose');

    let admin = null;
    if (mongoose.connection.readyState === 1) {
      admin = await AdminUser.findOne({ username });
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    if (!admin.password || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
