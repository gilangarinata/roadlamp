const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const deviceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    kml_url: {
        type: String,
    },
    kml_filename: {
        type: String,
    },
    description: {
        type: String,
        required: true
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
        type: String
    },
    position: {
        type: String
    },
    referal: {
        type: String
    },
    referalFrom: {
        type: String
    },
    referalRuasFrom: {
        type: String
    },
    ruasJalan: {
        type: String
    },
    referalFrom2: [
        String
    ],
    segment: {
        type: String,
        default: ""
    }
});

deviceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Device', deviceSchema);