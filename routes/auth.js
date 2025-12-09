const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.use((req, res, next) => {
    console.log('AUTH ROUTE HIT:', req.method, req.url);
    next();
});

router.post('/register', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            console.log('Missing fields');
            return res.status(400).json({ error: 'All fields required' });
        }

        console.log('Checking for existing user...');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ error: 'Email already exists' });
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('Creating user...');
        const user = new User({ email, password: hashedPassword, name });
        await user.save();

        console.log('User created, generating token...');
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        console.log('Success!');
        res.status(201).json({ token, user: { id: user._id, email, name } });
    } catch (error) {
        console.error('REGISTER ERROR:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;