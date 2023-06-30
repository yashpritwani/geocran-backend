const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    extension: {
        type: String,
        trim: true,
        required: true
    },
    metadata: {
        type: Object
    },
    status: {
        type: String,
        default: 'ENCRYPTED',
        required: true
    },
    key: {
        type: String,
        trim: true,
        required: true
    },
    encryptedLink: {
        type: String,
        trim: true,
        required: false
    },
    contractAddress: {
        type: String,
        trim: true,
        required: false
    },
    state: {
        type: String,
        trim: true,
        required: false
    }
}, {timestamps: true});

module.exports = mongoose.model('File', FileSchema);