const Hardware = require("../models/hardware");
const mongoose = require("mongoose");
const { doc } = require("prettier");
const Schedule = require("../models/schedule")
const History = require("../models/history")
const Notification = require("../notif/firebase")
var cron = require('node-cron');
var lastNotif = 0;



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
                    message: 'New Hardware Created.'
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                })
            });

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
                    var sch = schedule.sort(function(a, b) {
                        var dateA = new Date("01/01/2020" + " " + String(a.hour) + ":" + String(a.minute) + ":00");
                        var dateB = new Date("01/01/2020" + " " + String(b.hour) + ":" + String(b.minute) + ":00");
                        return dateA - dateB;
                    });

                    if (lastNotif === 0 && resultHardware[0].alarm.length > 0) {
                        var payload = {
                            notification: {
                                title: "Peringatan Gangguan Device ID : " + resultHardware[0].hardwareId,
                                body: resultHardware[0].alarm
                            }
                        };
                        var topic = "seti-app-" + resultHardware[0].hardwareId;
                        Notification.admin.messaging().sendToTopic(topic, payload)
                            .then(function(response) {
                                console.log("Successfully sent message:", response);
                            })
                            .catch(function(error) {
                                console.log("Error sending message:", error);
                            });

                        lastNotif = resultHardware[0].alarm.length;
                    } else if (lastNotif > 0 && resultHardware[0].alarm.length === 0) {
                        console.log("2")
                        lastNotif = 0;
                    }


                    res.status(200).json({
                        lamp: resultHardware[0].lamp != null ? resultHardware[0].lamp : false,
                        brightness: resultHardware[0].brightness != null ? resultHardware[0].brightness : 0,
                        count: schedule.length,
                        schedule: sch.map(schedule => {
                            return {
                                hour: schedule.hour,
                                minute: schedule.minute,
                                brightness: schedule.brightness
                            }
                        })
                    })
                }).catch(err => {
                    console.log(err)
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

exports.hardware_update_history = (req, res, next) => {
    var date = req.body.date;
    var chargeCapacity = req.body.chargeCapacity;
    var dischargeCapacity = req.body.dischargeCapacity;
    var batteryCapacity = req.body.batteryCapacity;
    var batteryLife = req.body.batteryLife;
    var hardwareId = req.body.hardwareId;

    const historyUpdate = new History({
        date: date,
        chargeCapacity: chargeCapacity,
        dischargeCapacity: dischargeCapacity,
        batteryCapacity: batteryCapacity,
        batteryLife: batteryLife,
        hardwareId: hardwareId
    });

    const historyAdd = new History({
        _id: new mongoose.Types.ObjectId(),
        date: date,
        chargeCapacity: chargeCapacity,
        dischargeCapacity: dischargeCapacity,
        batteryCapacity: batteryCapacity,
        batteryLife: batteryLife,
        hardwareId: hardwareId
    });


    History.find({ date: date, hardwareId: hardwareId }).exec().then(history => {
        if (history.length > 0) {
            History.update({ hardwareId: hardwareId, date: date }, { $set: historyUpdate }).exec().then(result => {
                res.status(200).json({
                    message: "History Update Success.",
                    code: 200
                });
            }).catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
        } else {
            console.log(historyUpdate)
            historyAdd.save().then(result => {
                res.status(200).json({
                    message: 'New History Created.',
                    code: 200
                });
            }).catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            });
        }
    }).catch((err) => {
        res.status(500).json({
            error: err,
        });
    });
}

exports.hardware_history_get_all = (req, res, next) => {
    History.find()
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.count,
                history: docs
            });
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
}


exports.hardware_history_get = (req, res, next) => {
    const hardwareId = req.params.hardwareId;
    History.find({ hardwareId: hardwareId })
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.count,
                history: docs
            });
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
}