const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const deviceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        default: 0
    },
    description: {
        type: String,
        required: true,
        default: 0
    },
    hardware: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hardware',
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
});

deviceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Device', deviceSchema);