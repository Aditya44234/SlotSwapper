const mongoose = require('mongoose');


const STATUS = ['BUSY', 'SWAPPABLE', 'SWAP_PENDING']


const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },

    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: STATUS,
        default: 'BUSY'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);


