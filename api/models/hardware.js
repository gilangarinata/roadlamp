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
    brightnessSchedule: {
        type: Number
    },
    capacity: {
        type: Number,
        required: true,
        default: 0
    },
    chargingTime: {
        type: String,
        required: true,
        default: 0
    },
    dischargingTime: {
        type: String,
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
        default: null
    },
    lastUpdate: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: false
    },
    temperature: {
        type: String
    },
    humidity: {
        type: String
    },
    connectedTo: {
        type: String
    },
    batteryHealthDecimal: {
        type: String
    }
});

module.exports = mongoose.model('Hardware', hardwareSchema);