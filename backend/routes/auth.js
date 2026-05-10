const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/protect');
const { getJwtSecret } = require('../lib/jwt-secret');

const router = express.Router();

const JWT_SECRET = getJwtSecret();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, hospitalId } = req.body;
    
    // Check for our custom unique ID constraint
    if (hospitalId !== 'DOC123') {
      return res.status(400).json({ error: 'Invalid unique ID constraint.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      hospitalId
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Identifier can be DOC123 or email (as per requirements mostly DOC123)
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { hospitalId: identifier }] 
    });
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
