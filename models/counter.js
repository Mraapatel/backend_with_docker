const mongoose = require('mongoose');
const { Schema } = require('mongoose');
// const { createRide } = require('../models/createRide');

const counterSchema = new Schema({
    index_name: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
});

const Counter = mongoose.model('counters', counterSchema);

module.exports = { Counter }


