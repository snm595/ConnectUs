const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controllers will be implemented later
// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, flatNumber, trustedContacts, community, role } = req.body;

    // Debug log incoming request
    console.log('Register request:', req.body);

    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      flatNumber,
      trustedContacts,
      community,
      role
    });

    await user.save();

    // Optionally generate a JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'User registered successfully', token, user });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

// Login Route with debug logs
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log('Login attempt:', { email, role });

    // Find user by email and role (force role to lowercase for consistency)
    const user = await User.findOne({ email, role: (role || '').toLowerCase() });
    console.log('User found:', user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email, password, or role.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email, password, or role.' });
    }

    // Generate JWT (optional)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Respond with user info (omit password)
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: 'Login successful', token, user: userObj });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
