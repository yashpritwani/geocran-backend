const mongoose = require('mongoose');

const CoordinateSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Coordinate', CoordinateSchema);