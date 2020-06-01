const mongoose = require('mongoose');

const hardwareSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        default: 0
    },
    temperature: {
        type: Number,
        required: true,
        default: 0
    },
    voltage: {
        type: Number,
        required: true,
        default: 0
    },
    current: {
        type: Number,
        required: true,
        default: 0
    },
    hardwareId: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Hardware', hardwareSchema);