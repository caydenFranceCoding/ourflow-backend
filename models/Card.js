const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const cardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    column: { type: String, default: 'todo' },
    pomodoros: { type: Number, default: 0 },
    journal: [journalEntrySchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', cardSchema);