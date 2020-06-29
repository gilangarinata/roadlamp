const Hardware = require("../models/hardware");
const mongoose = require("mongoose");
const { doc } = require("prettier");
const Schedule = require("../models/schedule")

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



// exports.hardware_update_hardware = (req, res, next) => {
//     const hardwareId = req.body.hardwareId;
//     Hardware.find({ hardwareId }).exec().then(resultHardware => {
//         //add new hardware if hardwareId doesn't exist
//         if (resultHardware.length < 1) {
//             const hardware = new Hardware({
//                 _id: new mongoose.Types.ObjectId(),
//                 name: req.body.name,
//                 capacity: req.body.capacity,
//                 chargingTime: req.body.chargingTime,
//                 dischargingTime: req.body.dischargingTime,
//                 betteryHealth: req.body.betteryHealth,
//                 alarm: req.body.alarm,
//                 longitude: req.body.longitude,
//                 latitude: req.body.latitude,
//                 hardwareId: req.body.hardwareId
//             });

//             hardware.save().then(result => {
//                 res.status(200).json({
//                     message: 'New Hardware Created.',
//                     hardware: result
//                 });
//             }).catch(err => {
//                 res.status(500).json({
//                     error: err
//                 })
//             });

//             //Update particular hardware
//         } else {
//             const hardware = new Hardware({
//                 name: req.body.name,
//                 capacity: req.body.capacity,
//                 chargingTime: req.body.chargingTime,
//                 dischargingTime: req.body.dischargingTime,
//                 betteryHealth: req.body.betteryHealth,
//                 alarm: req.body.alarm,
//                 longitude: req.body.longitude,
//                 latitude: req.body.latitude,
//             });



//             Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
//                 Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
//                     if (schedule.length > 0) {
//                         res.status(200).json({
//                             message: 'Value Updated.',
//                             hardware: resultHardware,
//                             schedule: schedule
//                         })
//                     } else {
//                         res.status(200).json({
//                             message: 'Value Updated.',
//                             hardware: resultHardware,
//                             schedule: 'Belum ada data'
//                         })
//                     }
//                 }).catch(err => {
//                     console.log('no schedule found')
//                 });
//             }).catch(err => {
//                 res.status(500).json({
//                     error: err
//                 })
//             });
//         }
//     }).catch(err => {
//         res.status(500).json({
//             error: err
//         })
//     });
// }


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
                    message: 'New Hardware Created.'
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
                Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
                    if (schedule.length > 0) {
                        res.status(200).json({
                            lamp: resultHardware[0].lamp != null ? resultHardware[0].lamp : false,
                            brightness: resultHardware[0].brightness != null ? resultHardware[0].brightness : 0,
                            count: schedule.length,
                            schedule: schedule.map(schedule => {
                                return {
                                    hour: schedule.hour,
                                    minute: schedule.minute,
                                    brightness: schedule.brightness
                                }
                            })
                        })
                    } else {
                        res.status(200).json({
                            lamp: resultHardware[0].lamp != null ? resultHardware[0].lamp : false,
                            brightness: resultHardware[0].brightness != null ? resultHardware[0].brightness : 0,
                            count: schedule.length,
                            schedule: schedule.map(schedule => {
                                return {
                                    hour: schedule.hour,
                                    minute: schedule.minute,
                                    brightness: schedule.brightness
                                }
                            })
                        })
                    }
                }).catch(err => {
                    console.log('no schedule found')
                });
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

exports.hardware_delete = (req, res, next) => {
    Hardware.deleteOne({ hardwareId: req.params.id })
        .exec()
        .then((result) => {
            res.status(200).json({
                message: "Hardware deleted",
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
};