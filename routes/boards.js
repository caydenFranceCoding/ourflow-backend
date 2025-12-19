const express = require('express');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const Card = require('../models/Card');
const User = require('../models/User');
const { sendInviteEmail } = require('../utils/email');

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
        }).populate('owner', 'name email').populate('collaborators', 'name email');
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const board = await Board.findOne({
            _id: req.params.id,
            $or: [{ owner: req.userId }, { collaborators: req.userId }]
        }).populate('collaborators', 'name email').populate('owner', 'name email');
        
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        
        res.json(board);
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

router.post('/:id/invite', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const board = await Board.findOne({ _id: req.params.id, owner: req.userId });
        
        if (!board) {
            return res.status(404).json({ error: 'Board not found or not authorized' });
        }
        
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (userToInvite._id.toString() === req.userId) {
            return res.status(400).json({ error: 'Cannot invite yourself' });
        }
        
        if (board.collaborators.includes(userToInvite._id)) {
            return res.status(400).json({ error: 'User already a collaborator' });
        }
        
        board.collaborators.push(userToInvite._id);
        await board.save();

        const inviter = await User.findById(req.userId);
        sendInviteEmail(email, inviter.name, board.name);
        
        const updatedBoard = await Board.findById(board._id)
            .populate('collaborators', 'name email')
            .populate('owner', 'name email');
        
        res.json({ message: 'User invited', board: updatedBoard });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id/collaborators/:oderId', auth, async (req, res) => {
    try {
        const board = await Board.findOne({ _id: req.params.id, owner: req.userId });
        
        if (!board) {
            return res.status(404).json({ error: 'Board not found or not authorized' });
        }
        
        board.collaborators = board.collaborators.filter(
            id => id.toString() !== req.params.oderId
        );
        await board.save();
        
        const updatedBoard = await Board.findById(board._id)
            .populate('collaborators', 'name email')
            .populate('owner', 'name email');
        
        res.json({ message: 'Collaborator removed', board: updatedBoard });
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