const mongoose = require('mongoose');

const hardwareSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    lamp: {
        type: Boolean
    },
    brightness: {
        type: Number
    },
    capacity: {
        type: Number,
        required: true,
        default: 0
    },
    chargingTime: {
        type: Number,
        required: true,
        default: 0
    },
    dischargingTime: {
        type: Number,
        required: true,
        default: 0
    },
    betteryHealth: {
        type: Number,
        required: true,
        default: 0
    },
    alarm: {
        type: String,
        default: ""
    },
    longitude: {
        type: String,
        required: true
    },
    latitude: {
        type: String,
        required: true
    },
    hardwareId: {
        type: String,
        require: true
    },
    photoPath: {
        type: String,
        unique: true,
        default: ""
    }
});

module.exports = mongoose.model('Hardware', hardwareSchema);