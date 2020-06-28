const Hardware = require("../models/hardware");
const mongoose = require("mongoose");
const { doc } = require("prettier");

exports.hardware_get_all = (req, res, next) => {
    Hardware.find()
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.count,
                orders: docs
            });
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
}

exports.hardware_update_hardware = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    Hardware.find({ hardwareId }).exec().then(resultHardware => {
        //add new hardware if hardwareId doesn't exist
        if (resultHardware.length < 1) {
            const hardware = new Hardware({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                capacity: req.body.capacity,
                chargingTime: req.body.chargingTime,
                dischargingTime: req.body.dischargingTime,
                betteryHealth: req.body.betteryHealth,
                alarm: req.body.alarm,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
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
                name: req.body.name,
                capacity: req.body.capacity,
                chargingTime: req.body.chargingTime,
                dischargingTime: req.body.dischargingTime,
                betteryHealth: req.body.betteryHealth,
                alarm: req.body.alarm,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
            });

            Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
                res.status(200).json({
                    message: 'Value Updated.',
                    hardware: resultHardware
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

exports.hardware_get = (req, res, next) => {
    const id = req.params.id;
    Hardware.findById(id).exec().then(hardware => {
        res.status(200).json({
            result: hardware
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.hardware_check = (req, res, next) => {
    const id = req.params.id;
    Hardware.find({ hardwareId: id }).exec().then(hardware => {
        res.status(200).json({
            result: hardware
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}