const Device = require("../models/device");
const User = require("../models/user");
const Hardware = require("../models/hardware");
const Schedule = require("../models/schedule")
const mongoose = require("mongoose");
const process = require("../../nodemon.json");
const { schedule } = require("node-cron");
const fs = require("fs");
const hardware = require("../models/hardware");
const { use } = require("../../app");
const user = require("../models/user");
const { check } = require("prettier");

exports.devices_get_web = (req, res, next) => {
    const userId = req.params.userId;
    var userIdSuperuser2;
    var deviceArray = Array()
    var i = 0;
    User.findById(userId).exec().then(users => {
        if (users != null) {
            if (users.position === "superuser1") {

                Device.find({ user: userId }).populate('hardware').select('name description _id hardware user').exec().then(device => {
                    if (device.length > 0) {
                        for (var j = 0; j < device.length; j++) {
                            deviceArray.push(device[j].hardware)
                        }
                    }

                    User.find({ referalSU1: users.referal }).exec().then(users => {

                        if (users.length > 0) {
                            userIdSuperuser2 = users;
                            fetchDevice();
                        } else {
                            return res.status(200).json({
                                count: deviceArray.length,
                                result: deviceArray,
                            })
                        }
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

            } else if (users.position === "superuser2") {
                console.log("2")
                Device.find({ user: userId }).populate('hardware').select('name description _id hardware user').exec().then(device => {

                    if (device.length > 0) {
                        for (var j = 0; j < device.length; j++) {
                            deviceArray.push(device[j].hardware)
                        }
                    }
                    User.find({ referalFrom: users.referal }).exec().then(users => {
                        if (users.length > 0) {
                            userIdSuperuser2 = users;
                            fetchDevice();
                        } else {
                            return res.status(200).json({
                                count: deviceArray.length,
                                result: deviceArray,
                            })
                        }
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
            } else if (users.position === "user") {
                console.log("3")
                Device.find({ user: userId }).populate('hardware').select('name description _id hardware user').exec().then(device => {
                    if (!device) {
                        return res.status(404).json({
                            message: "Devices Not Found."
                        })
                    }

                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j].hardware)
                    }

                    res.status(200).json({
                        count: device.length,
                        result: deviceArray,
                    })
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    })
                });
            } else {
                return res.status(404).json({
                    message: "Position Not Found"
                })
            }
        } else {
            return res.status(404).json({
                message: "Users Not Found."
            })
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });;

    function fetchDevice() {
        Device.find({ user: userIdSuperuser2[i]._id }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
            if (device) {
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j].hardware)
                    }
                }
            }
            i++
            if (i < userIdSuperuser2.length) {
                fetchDevice()
            } else {
                res.status(200).json({
                    count: deviceArray.length,
                    result: deviceArray,
                })
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
    }



}

exports.devices_get_all = (req, res, next) => {
    Device.find().populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
        return res.status(200).json({
            count: 0,
            result: device,
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.devices_get_v2 = (req, res, next) => {
    const userId = req.params.userId;
    var userIdSuperuser2 = Array();
    var deviceArray = Array()
    var i = 0;
    var isSuperuser1;
    User.findById(userId).exec().then(users => {
        if (users != null) {
            if (users.position === "superuser1") {
                isSuperuser1 = true;
            } else {
                isSuperuser1 = false;
            }

            Device.find({ user: userId }).populate('hardware', 'hardwareId name lamp brightness').select('name description _id hardware user username position referal').exec().then(device => {
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j])
                    }
                }


                User.find({ referalFrom: users.referal }).exec().then(users => {
                    if (users.length > 0) {
                        if (isSuperuser1) {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i].position === "superuser2") {
                                    userIdSuperuser2.push(users[i]);
                                }
                            }
                        } else {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i].position === "user") {
                                    userIdSuperuser2.push(users[i]);
                                }
                            }
                        }

                        fetchDevice2();
                    } else {
                        return res.status(200).json({
                            count: deviceArray.length,
                            result: deviceArray,
                        })
                    }
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

        } else {
            return res.status(404).json({
                message: "Users Not Found."
            })
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });;



    function fetchDevice2() {
        Device.find({ user: userIdSuperuser2[i]._id }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
            console.lof(device);
            if (device) {
                if (device.length > 0) {
                    loop1: for (var j = 0; j < device.length; j++) {
                        for (var i = 0; i < deviceArray.length; i++) {
                            if (deviceArray[i].username === device[j].username) {
                                continue loop1;
                            }
                        }
                        deviceArray.push(device[j])
                    }
                }
            }
            i++
            if (i < userIdSuperuser2.length) {
                fetchDevice2()
            } else {
                res.status(200).json({
                    count: deviceArray.length,
                    result: deviceArray,
                })
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
    }
}

exports.devices_get = (req, res, next) => {
    const userId = req.params.userId;
    var userIdSuperuser2;
    var deviceArray = Array()
    var i = 0;
    User.findById(userId).exec().then(users => {
        if (users != null) {

            if (users.position === "superuser1") {
                Device.find({ user: userId }).populate('hardware', 'hardwareId name lamp brightness').select('name description _id hardware user').exec().then(device => {
                    if (device.length > 0) {
                        for (var j = 0; j < device.length; j++) {
                            deviceArray.push(device[j])
                        }
                    }

                    User.find({ referalSU1: users.referal }).exec().then(users => {
                        if (users.length > 0) {
                            userIdSuperuser2 = users;
                            fetchDevice();
                        } else {
                            return res.status(200).json({
                                count: deviceArray.length,
                                result: deviceArray,
                            })
                        }
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

            } else if (users.position === "superuser2") {
                Device.find({ user: userId }).populate('hardware', 'hardwareId name lamp brightness').select('name description _id hardware user').exec().then(device => {
                    if (device.length > 0) {
                        for (var j = 0; j < device.length; j++) {
                            deviceArray.push(device[j])
                        }
                    }
                    User.find({ referalFrom: users.referal }).exec().then(users => {
                        if (users.length > 0) {
                            userIdSuperuser2 = users;
                            fetchDevice();
                        } else {
                            return res.status(200).json({
                                count: deviceArray.length,
                                result: deviceArray,
                            })
                        }
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
            } else if (users.position === "user") {
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
            } else {
                return res.status(404).json({
                    message: "Position Not Found"
                })
            }
        } else {
            return res.status(404).json({
                message: "Users Not Found."
            })
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });;

    function fetchDevice() {
        Device.find({ user: userIdSuperuser2[i]._id }).populate('hardware', 'hardwareId name lamp brightness').select('name description _id hardware user').exec().then(device => {
            if (device) {
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j])
                    }
                }
            }
            i++
            if (i < userIdSuperuser2.length) {
                fetchDevice()
            } else {
                res.status(200).json({
                    count: deviceArray.length,
                    result: deviceArray,
                })
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
    }



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

exports.devices_set_lamp_web = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    const lamp = req.body.lamp;

    const updateOps = {
        lamp: lamp
    }
    Hardware.update({ _id: hardwareId }, { $set: updateOps }).exec().then(result => {
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
    console.log("gilang");
    const hardwareId = req.body.hardwareId;
    const path_image = req.file.path;
    const base_url = req.protocol + "://" + req.headers.host + '/';



    const updateOps = {
        photoPath: base_url + path_image
    }
    Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
        res.status(200).json({
            message: 'Image Updated.',
            result: result
        })
    }).catch(err => {
        res.status(501).json({
            error: err
        });
    });
}

exports.device_delete_img = (req, res, next) => {
    const hardwareId = req.params.hardwareId;
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
                    user: user._id,
                    username: user.username,
                    position: user.position,
                    referal: user.referal
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

exports.devices_delete_all = (req, res, next) => {
    Device.deleteMany().exec().then(message => {
        res.status(200).json({
            message: message
        })
    }).catch(err => {
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