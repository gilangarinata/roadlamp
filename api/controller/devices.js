const Device = require("../models/device");
const User = require("../models/user");
const Hardware = require("../models/hardware");
const Schedule = require("../models/schedule")
const mongoose = require("mongoose");
const process = require("../../nodemon.json");
const { schedule } = require("node-cron");
const fs = require("fs");
const hardware = require("../models/hardware");
const host = "104.43.171.129";

exports.devices_get = (req, res, next) => {
    const userId = req.params.userId;
    Device.find({ user: userId }).populate('hardware', 'hardwareId name lamp brightness').select('name description _id hardware user').exec().then(device => {
        if (!device) {
            return res.status(404).json({
                message: "Devices Not Found."
            })
        }
        res.status(200).json({
            count: device.length,
            result: device,
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.devices_set_lamp = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    const lamp = req.body.lamp;

    const updateOps = {
        lamp: lamp
    }
    Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
        res.status(200).json({
            message: 'Lamp Updated.'
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.devices_set_brightness = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    const brightness = req.body.brightness;

    const updateOps = {
        brightness: brightness
    }
    Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
        res.status(200).json({
            message: 'Brightness Updated.'
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.device_add_img = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    const path_image = req.file.path;
    const base_url = req.protocol + "://" + host + '/';

    const updateOps = {
        photoPath: base_url + path_image
    }
    Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
        res.status(200).json({
            message: 'Image Updated.',
            result: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.device_delete_img = (req, res, next) => {
    const hardwareId = req.params.hardwareId;

    console.log(hardwareId)

    const updateOps = {
        photoPath: null
    }
    Hardware.find({ hardwareId: hardwareId }).exec().then(hardware => {
        try {
            var photoPath = hardware[0].photoPath;
            var idxUpload = photoPath.indexOf("/uploads/") + 9;
            var filename = photoPath.substring(idxUpload, photoPath.length);
            fs.unlinkSync('./uploads/' + filename);
            Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
                res.status(200).json({
                    message: 'Image Deleted.',
                    result: result
                })
            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        } catch (err) {
            res.status(500).json({
                error: err
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });


}

exports.device_add = (req, res, next) => {
    const userId = req.body.userId;
    const hardwareId = req.body.hardwareId;
    // const path_image = req.file.path;
    // const base_url = req.protocol + "://" + req.headers.host + '/';


    User.findById(userId).exec().then(user => {
        if (user < 1) {
            return res.status(404).json({
                message: "User Not Found."
            });
        }

        Hardware.find({ hardwareId: hardwareId }).exec().then(result => {
            if (result.length > 0) {
                const device = new Device({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    description: req.body.description,
                    hardware: result[0]._id,
                    user: userId
                });

                return device.save().then(result => {
                    res.status(201).json({
                        message: "Device Added",
                        createdDevice: result,
                        hardwareId: hardwareId
                    })
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    });
                });
            }
            return res.status(404).json({
                message: 'Hardware ID not found.',
                info: {
                    hardwareId: hardwareId
                }
            })
        }).catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });

    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
}

exports.devices_delete = (req, res, next) => {
    const deviceId = req.params.deviceId;
    Device.find({ _id: deviceId }).populate('hardware').exec().then(device => {
        Schedule.deleteMany({ hardwareId: device[0].hardware.hardwareId }).exec().then(sch_result => {
            Device.deleteOne({ _id: deviceId }).exec().then(result => {
                res.status(200).json({
                    message: 'Device Already Deleted.',
                    status: result,
                    scheduleDeleted: sch_result,
                    hardwareId: device[0].hardware.hardwareId
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                })
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });


}

exports.devices_upload_image = (res, req, next) => {
    const userId = req.body.images;

}