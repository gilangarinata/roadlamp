const Hardware = require("../models/hardware");
const mongoose = require("mongoose");

exports.hardware_update_hardware = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    Hardware.find({ hardwareId }).exec().then(result => {
        //add new hardware if hardwareId doesn't exist
        if (result.length < 1) {
            const hardware = new Hardware({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                temperature: req.body.temperature,
                voltage: req.body.voltage,
                current: req.body.current,
                hardwareId: req.body.hardwareId
            });

            hardware.save().then(result => {
                res.status(200).json({
                    message: 'New Hardware Created.',
                    hardware: result
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                })
            });

            //Update particular hardware
        } else {
            const hardware = new Hardware({
                temperature: req.body.temperature,
                voltage: req.body.voltage,
                current: req.body.current,
            });

            Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
                res.status(200).json({
                    message: 'Value Updated.',
                    hardware: hardware
                })
            }).catch(err => {
                res.status(500).json({
                    error: err
                })
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}