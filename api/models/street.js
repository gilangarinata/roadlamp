const mongoose = require('mongoose');

const streetSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ruasJalan: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Street', streetSchema);