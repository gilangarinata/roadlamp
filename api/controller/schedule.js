const Schedule = require("../models/schedule");
const mongoose = require("mongoose");
const { use } = require("../routes/users");

const Hardware = require("../models/hardware");
const e = require("express");

exports.schedule_get = (req, res, next) => {
    const userId = req.params.userId;
    const hardwareId = req.params.hardwareId;
    Schedule.find({ userId: userId, hardwareId: hardwareId }).exec().then(schedule => {
        if (!schedule) {
            return res.status(404).json({
                message: "Schedule Not Found."
            })
        }
        res.status(200).json({
            count: schedule.length,
            result: schedule,
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
}

exports.schedule_get_by_device = (req, res, next) => {
    const hardwareId = req.params.hardwareId;
    Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
        if (!schedule) {
            return res.status(404).json({
                message: "Schedule Not Found."
            })
        }
        res.status(200).json({
            count: schedule.length,
            result: schedule,
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
}

exports.schedule_add = (req, res, next) => {
    const schedule = new Schedule({
        _id: new mongoose.Types.ObjectId(),
        minute: req.body.minute,
        hour: req.body.hour,
        day: req.body.day,
        brightness: req.body.brightness,
        userId: req.body.userId,
        hardwareId: req.body.hardwareId
    });

    console.log(parseInt(req.body.minute))

    schedule.save().then(result => {
        res.status(200).json({
            message: 'New Schedule Created.',
            schedule: result
        });

        var schedule = `${parseInt(req.body.minute)} ${parseInt(req.body.hour)} * * *`;
        var cron = require('node-cron');







        // const hardwareId = req.body.hardwareId;
        // const brightness = req.body.brightness;

        // const updateOps = {
        //     brightness: brightness
        // }
        // Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
        //     res.status(200).json({
        //         message: 'Brightness Updated.'
        //     })
        // }).catch(err => {
        //     res.status(500).json({
        //         error: err
        //     });
        // });

    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.schedule_edit = (req, res, next) => {
    const _id = req.params.id;
    const schedule = new Schedule({
        minute: req.body.minute,
        hour: req.body.hour,
        day: req.body.day,
        brightness: req.body.brightness,
        userId: req.body.userId
    });

    Schedule.update({ _id: _id }, { $set: schedule }).exec().then(result => {
        res.status(200).json({
            message: 'Value Updated.',
            schedule: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.schedule_delete = (req, res, next) => {
    Schedule.deleteOne({ _id: req.params.id })
        .exec()
        .then((result) => {
            res.status(200).json({
                message: "Schedule deleted",
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
};

exports.schedule_delete_all = (req, res, next) => {
    if (req.params.key == "imsuretodelete") {
        Schedule.remove({})
            .exec()
            .then((result) => {
                res.status(200).json({
                    message: "All Schedule deleted",
                    result: result
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    } else {
        res.status(500).json({
            message: "Wrong Key",
        });
    }
};