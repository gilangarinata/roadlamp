const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const scheduleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    minute: {
        type: String,
        require: true
    },
    hour: {
        type: String,
        require: true
    },
    day: {
        type: String,
        require: true
    },
    brightness: {
        type: Number,
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    hardwareId: {
        type: String,
        require: true
    }
});

scheduleSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Schedule', scheduleSchema);