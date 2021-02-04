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
    },
    username: {
        type: String,
        default: null
    },
    position: {
        type: String,
        default: null
    },
    referal: {
        type: String,
        default: null
    },
    referalFrom: {
        type: String
    },
    ruasJalan: {
        type: String
    }
});

deviceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Device', deviceSchema);