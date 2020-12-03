const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        required: true
    },
    chargeCapacity: {
        type: Number,
        required: true,
        default: 0
    },
    dischargeCapacity: {
        type: String,
        required: true,
        default: 0
    },
    batteryCapacity: {
        type: Number,
        required: true,
        default: 0
    },
    batteryLife: {
        type: Number,
        required: true,
        default: 0
    },
    hardwareId: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('History', historySchema);