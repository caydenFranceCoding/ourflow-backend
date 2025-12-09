const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('Loading routes...');
const authRoutes = require('./routes/auth');
console.log('Auth routes loaded');
const boardRoutes = require('./routes/boards');
console.log('Board routes loaded');
const cardRoutes = require('./routes/cards');
console.log('Card routes loaded');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`INCOMING: ${req.method} ${req.url}`);
    next();
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'OurFlow API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - UPDATED`);
});