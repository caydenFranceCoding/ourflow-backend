const express = require('express');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const Card = require('../models/Card');

const router = express.Router();

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'No token provided' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/', auth, async (req, res) => {
    try {
        const boards = await Board.find({
            $or: [{ owner: req.userId }, { collaborators: req.userId }]
        });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const board = new Board({ name, owner: req.userId });
        await board.save();
        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.userId });
        if (!board) return res.status(404).json({ error: 'Board not found' });
        
        await Card.deleteMany({ board: req.params.id });
        res.json({ message: 'Board deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;