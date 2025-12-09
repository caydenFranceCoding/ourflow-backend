const express = require('express');
const jwt = require('jsonwebtoken');
const Card = require('../models/Card');
const Board = require('../models/Board');

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

router.get('/board/:boardId', auth, async (req, res) => {
    try {
        const cards = await Card.find({ board: req.params.boardId });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { title, boardId } = req.body;
        const card = new Card({ title, board: boardId });
        await card.save();
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { title, column, pomodoros } = req.body;
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { title, column, pomodoros },
            { new: true }
        );
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json({ message: 'Card deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:id/journal', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        
        card.journal.unshift({ text });
        await card.save();
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id/pomodoro', auth, async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { $inc: { pomodoros: 1 } },
            { new: true }
        );
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;