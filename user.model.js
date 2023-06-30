const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fName: {
        type: String,
        trim: true,
        required: false
    },
    lName: {
        type: String,
        trim: true,
        required: false
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
    },
    authorized: {
        type: Boolean,
        default: false,
    },
    phoneNum: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: false,
    },
    currentQuiz: {
        type: Number,
        required: true,
        default: 0
    },
    rewardPoints: {
        type: Number,
        required: true,
        default: 0
    },
    givenQuiz: {
        type: Number,
        required: true,
        default: 0
    },
    Welcome: {
        type: Number,
        required: true,
        default: 0
    },
    Ebook: {
        type: Number,
        required: true,
        default: 0
    },
    Update: {
        type: Number,
        required: true,
        default: 0
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    Extra: {
        type: Number,
        required: true,
        default: 0
    },
    Other: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true});

module.exports = mongoose.model('Users', UserSchema);