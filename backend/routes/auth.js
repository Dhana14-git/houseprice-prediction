const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
    try {
        // FIXED: Changed fullName to username to match your React Auth.jsx
        const { username, email, password } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // 2. Create new user instance
        user = new User({ username, email, password });

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Save to MongoDB
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ msg: 'Server error during registration' });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
  
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, // FIXED: Matches updated field
                email: user.email 
            } 
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;