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
const { hardware_get_all } = require("./hardware");
const e = require("cors");
const builder = require('xmlbuilder', { encoding: 'utf-8' });


exports.devices_get_web = (req, res, next) => {
    const userId = req.params.userId;
    var userIdSuperuser = Array();
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

            Device.find({ user: userId }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
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
                                    userIdSuperuser.push(users[i]);
                                }
                            }
                        } else {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i].position === "user") {
                                    userIdSuperuser.push(users[i]);
                                }
                            }
                        }

                        fetchDevice3();
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

    function fetchDevice3() {
        Device.find({ user: userIdSuperuser[i]._id }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
            if (device) {
                var hardwareEv;
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j])
                    }
                }
            }
            for (var k = 0; k < deviceArray.length; k++) {
                Hardware.update({ hardwareId: deviceArray[k].hardware.hardwareId }, { $set: { active: checkDeviceIsActive(deviceArray[k].hardware) } }).then(result => console.log("success updating harware")).catch(e => console.log("error updating harware :" + e));
            }

            i++
            if (i < userIdSuperuser.length) {
                fetchDevice3()
            } else {
                res.status(200).json({
                    count: deviceArray.length,
                    result: deviceArray,
                })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    }


    function checkDeviceIsActive(hardware) {
        var isActive = false;
        if (hardware != null) {
            if (hardware.lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = hardware.lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    console.log(diffTime + " milliseconds  DV" + hardware.hardwareId);

                    if (diffTime < 120000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        if (hardware.hardwareId == "B251") {
            console.log("B251 " + isActive)
        }
        return isActive;
    }
}

exports.devices_get_web_map = (req, res, next) => {
    const userId = req.params.userId;
    var userIdSuperuser = Array();
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

            Device.find({ user: userId }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j])
                    }
                }

                User.find({
                    $or: [{
                        referalFrom: users.referal
                    }, {
                        referalSU1: users.referal
                    }]
                }).exec().then(users => {
                    if (users.length > 0) {
                        if (isSuperuser1) {
                            for (var i = 0; i < users.length; i++) {
                                console.log(users[i]);
                                if (users[i].position === "superuser2") {
                                    userIdSuperuser.push(users[i]);
                                } else if (users[i].position === "user") {
                                    userIdSuperuser.push(users[i]);
                                }
                            }
                        } else {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i].position === "user") {
                                    userIdSuperuser.push(users[i]);
                                }
                            }
                        }

                        fetchDevice3();
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

    function fetchDevice3() {
        Device.find({ user: userIdSuperuser[i]._id }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
            if (device) {
                var hardwareEv;
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        deviceArray.push(device[j])
                    }
                }
            }

            for (var k = 0; k < deviceArray.length; k++) {
                Hardware.update({ hardwareId: deviceArray[k].hardware.hardwareId }, { $set: { active: checkDeviceIsActive(deviceArray[k].hardware) } }).then(result => console.log("success updating harware")).catch(e => console.log("error updating harware :" + e));
            }

            i++
            if (i < userIdSuperuser.length) {
                fetchDevice3()
            } else {
                res.status(200).json({
                    count: deviceArray.length,
                    result: deviceArray,
                })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    }


    function checkDeviceIsActive(hardware) {
        var isActive = false;
        if (hardware != null) {
            if (hardware.lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = hardware.lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    console.log(diffTime + " milliseconds  DV" + hardware.hardwareId);

                    if (diffTime < 120000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        if (hardware.hardwareId == "B251") {
            console.log("B251 " + isActive)
        }
        return isActive;
    }
}

exports.devices_get_all = (req, res, next) => {
    Device.find().populate('hardware').exec().then(device => {
        return res.status(200).json({
            count: device.length,
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
    var userIdSuperuser = Array();
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

            Device.find({ user: userId }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
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
                                    userIdSuperuser.push(users[i]);
                                }
                            }
                        } else {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i].position === "user") {
                                    userIdSuperuser.push(users[i]);
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
        Device.find({ user: userIdSuperuser[i]._id }).populate('hardware').select('name description _id hardware user username position referal').exec().then(device => {
            if (device) {
                var hardwareEv;
                if (device.length > 0) {
                    hardwareEv = device[0].hardware;
                    loop1: for (var j = 0; j < device.length; j++) {
                        for (var k = 0; k < deviceArray.length; k++) {
                            if (deviceArray[k].username === device[j].username) {
                                continue loop1;
                            }
                        }
                        deviceArray.push(device[j])
                    }
                } else {
                    const hardwares = new Hardware({
                        capacity: 67,
                        chargingTime: '0.00',
                        dischargingTime: '0.00',
                        betteryHealth: 100,
                        alarm: '0',
                        photoPath: null,
                        lastUpdate: "2021-01-21T15:07:01.734Z",
                        active: true,
                        _id: new mongoose.Types.ObjectId(),
                        name: 'PJU-A250',
                        longitude: '112.74000',
                        latitude: '-7.34216',
                        hardwareId: 'A250',
                        __v: 0,
                        lamp: false,
                        brightness: 0,
                        brightnessSchedule: 100
                    })


                    const devices = new Device({
                        _id: new mongoose.Types.ObjectId(),
                        name: "",
                        description: "",
                        user: userIdSuperuser[i]._id,
                        hardware: hardwares,
                        username: userIdSuperuser[i].username,
                        position: userIdSuperuser[i].position,
                        referal: userIdSuperuser[i].referal
                    });
                    deviceArray.push(devices);

                }
            }

            for (var k = 0; k < deviceArray.length; k++) {
                Hardware.update({ hardwareId: deviceArray[k].hardware.hardwareId }, { $set: { active: checkDeviceIsActive(deviceArray[k].hardware) } }).then(result => console.log("success updating harware")).catch(e => console.log("error updating harware :" + e));
            }

            i++
            if (i < userIdSuperuser.length) {
                fetchDevice2()
            } else {
                res.status(200).json({
                    count: deviceArray.length,
                    result: deviceArray,
                })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    }

    function checkDeviceIsActive(hardware) {
        var isActive = false;
        if (hardware != null) {
            if (hardware.lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = hardware.lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    console.log(diffTime + " milliseconds  DV" + hardware.hardwareId);

                    if (diffTime < 120000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        if (hardware.hardwareId == "B251") {
            console.log("B251 " + isActive)
        }
        return isActive;
    }
}


exports.devices_process_earth = (req, res, next) => {
    const userId = req.params.userId;
    const ruasJalan = req.params.ruasJalan;


    var kml = builder.create('kml', { version: '1.0', encoding: 'UTF-8', standalone: true });
    kml
        .att('xmlns', "http://www.opengis.net/kml/2.2")
        .att('xmlns:gx', "http://www.google.com/kml/ext/2.2")
        .att('xmlns:kml', "http://www.opengis.net/kml/2.2")
        .att('xmlns:atom', "http://www.w3.org/2005/Atom")

    var documents = kml.ele('Document')
        .ele('name', "test.kmz").up()

    .ele('Style')
        .att("id", 'Normal0_04')

    //     <BalloonStyle>
    //     <text>$[description]</text>
    // </BalloonStyle>
    // <LineStyle>
    //     <width>2</width>
    // </LineStyle>


    .ele('IconStyle')
        .ele('Icon')
        .ele('href', 'http://www.earthpoint.us/Dots/GoogleEarth/pal5/icon57.png').up()
        .up()
        .up()

    .ele('BalloonStyle')
        .ele('text', '$[description]')
        .up()
        .up()

    .ele('LineStyle').ele('width', 2)
        .up()
        .up()
        .up()

    .ele('StyleMap')
        .att('id', '0_0')
        .ele('Pair')
        .ele('key', 'normal')
        .up()
        .ele('styleUrl', '#Normal0_04')
        .up()
        .up()

    .ele('Pair')
        .ele('key', 'highlight')
        .up()
        .ele('styleUrl', '#Highlight0_00')
        .up()
        .up()
        .up()

    .ele('Style')
        .att("id", 'Highlight0_00')

    //     <BalloonStyle>
    //     <text>$[description]</text>
    // </BalloonStyle>
    // <LineStyle>
    //     <width>2</width>
    // </LineStyle>


    .ele('IconStyle')
        .ele('scale', '1.1').up()
        .ele('Icon')
        .ele('href', 'http://www.earthpoint.us/Dots/GoogleEarth/pal5/icon57.png').up()
        .up()
        .up()

    .ele('BalloonStyle')
        .ele('text', '$[description]')
        .up()
        .up()

    .ele('LineStyle').ele('width', 3)
        .up()
        .up()
        .up()

    var folder = documents.ele('Folder')
        .ele('name', 'asas').up()
        .ele('open', 1).up()
        .ele('LookAt')
        .ele('longitude', 107.610591666667).up()
        .ele('latitude', -6.358549999999999).up()
        .ele('altitude', 0).up()
        .ele('heading', 0).up()
        .ele('tilt', 0).up()
        .ele('range', 5915).up().up()


    for (var i = 1; i <= 3; i++) {
        var item = folder.ele('Placemark');
        item.ele('name', 'APJ-01').up();
        item.ele('Snippet').att('maxLines', 0).up();

        var lookat = item.ele('LookAt');
        lookat.ele('longitude', 107.610216666667);
        lookat.ele('latitude', -6.358549999999999);
        lookat.ele('altitude', 0);
        lookat.ele('heading', 0);
        lookat.ele('tilt', 0);
        lookat.ele('range', 1000);
        lookat.ele('altitudeMode', 'relativeToGround');

        item.ele('styleUrl', '#0_0');
        item.ele('ExtendedData');

        var point = item.ele('Point');
        point.ele('coordinates', "107.610216666667, -6.37501944444444, 0")


    }


    var doc = kml.end({ pretty: true });


    var xmldoc = kml.toString({ pretty: true });

    var dirPath = "./uploads/earth.kml";

    fs.writeFile(dirPath, xmldoc, function(err) {
        if (err) { return console.log(err); }
        console.log("The file was saved!");
        res.render('index', { title: 'Generate XML using NodeJS' });

    });


    res.set('Content-Type', 'text/xml');
    res.send(doc);

    console.log(doc);
}

exports.devices_get_v3 = (req, res, next) => {
    const userId = req.body.userId;
    const ruasJalan = req.body.ruasJalan;
    var userIdSuperuser = Array();
    var deviceArray = Array()
    var i = 0;
    const base_url = req.protocol + "://" + req.headers.host + '/';

    User.findById(userId).exec().then(users => {
        if (users != null) {
            User.find({ referalFrom2: users.referal }).exec().then(commonUsers => {
                if (commonUsers.length > 0) {
                    for (var i = 0; i < commonUsers.length; i++) {
                        userIdSuperuser.push(commonUsers[i]);
                    }
                    fetchDevice4();
                } else {
                    return res.status(200).json({
                        kml: "",
                        count: 0,
                        result: [],
                    })
                }

            }).catch(err => console.log(err));
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

    function fetchDevice4() {
        Device.find({ user: userIdSuperuser[i]._id }).populate('hardware').exec().then(device => {
            if (device) {
                if (device.length > 0) {
                    for (var j = 0; j < device.length; j++) {
                        if (device[j].ruasJalan == ruasJalan) {
                            deviceArray.push(device[j])
                        }
                    }
                }
            }

            for (var k = 0; k < deviceArray.length; k++) {
                Hardware.update({ hardwareId: deviceArray[k].hardware.hardwareId }, { $set: { active: checkDeviceIsActive(deviceArray[k].hardware) } }).then(result => console.log("success updating harware ")).catch(e => console.log("error updating harware :" + e));
            }

            i++
            if (i < userIdSuperuser.length) {
                fetchDevice4()
            } else {
                processEarth(userId, ruasJalan.replace(/ /g, ''), deviceArray)
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    }

    function processEarth(userId, ruasJalan, deviceArray) {
        var kml = builder.create('kml', { version: '1.0', encoding: 'UTF-8', standalone: true });
        kml
            .att('xmlns', "http://www.opengis.net/kml/2.2")
            .att('xmlns:gx', "http://www.google.com/kml/ext/2.2")
            .att('xmlns:kml', "http://www.opengis.net/kml/2.2")
            .att('xmlns:atom', "http://www.w3.org/2005/Atom")

        var documents = kml.ele('Document')
            .ele('name', ruasJalan).up()

        .ele('Style')
            .att("id", 'Normal0_04')

        .ele('IconStyle')
            .ele('Icon')
            .ele('href', 'http://www.earthpoint.us/Dots/GoogleEarth/pal5/icon57.png').up()
            .up()
            .up()

        .ele('BalloonStyle')
            .ele('text', '$[description]')
            .up()
            .up()

        .ele('LineStyle').ele('width', 2)
            .up()
            .up()
            .up()

        .ele('StyleMap')
            .att('id', '0_0')
            .ele('Pair')
            .ele('key', 'normal')
            .up()
            .ele('styleUrl', '#Normal0_04')
            .up()
            .up()

        .ele('Pair')
            .ele('key', 'highlight')
            .up()
            .ele('styleUrl', '#Highlight0_00')
            .up()
            .up()
            .up()

        .ele('Style')
            .att("id", 'Highlight0_00')


        .ele('IconStyle')
            .ele('scale', '1.1').up()
            .ele('Icon')
            .ele('href', 'http://www.earthpoint.us/Dots/GoogleEarth/pal5/icon57.png').up()
            .up()
            .up()

        .ele('BalloonStyle')
            .ele('text', '$[description]')
            .up()
            .up()

        .ele('LineStyle').ele('width', 3)
            .up()
            .up()
            .up()

        var folder = documents.ele('Folder')
            .ele('name', ruasJalan).up()
            .ele('open', 1).up()
            .ele('LookAt')
            .ele('longitude', deviceArray[0].hardware.longitude).up()
            .ele('latitude', deviceArray[0].hardware.latitude).up()
            .ele('altitude', 0).up()
            .ele('heading', 0).up()
            .ele('tilt', 0).up()
            .ele('range', 10000).up().up()

        var newDeviceArray = [];

        for (var i = 0; i < deviceArray.length; i++) {


            console.log(deviceArray[i].name + "");

            var name = "";
            var deviceName = deviceArray[i].name;
            if (deviceName) {
                name = deviceArray[i].name;
            }

            var item = folder.ele('Placemark');
            item.ele('name', name).up();
            item.ele('Snippet').att('maxLines', 0).up();

            var lookat = item.ele('LookAt');
            lookat.ele('longitude', deviceArray[i].hardware.longitude);
            lookat.ele('latitude', deviceArray[i].hardware.latitude);
            lookat.ele('altitude', 0);
            lookat.ele('heading', 0);
            lookat.ele('tilt', 0);
            lookat.ele('range', 1000);
            lookat.ele('altitudeMode', 'relativeToGround');

            item.ele('styleUrl', '#0_0');
            item.ele('ExtendedData');

            var point = item.ele('Point');
            point.ele('coordinates', deviceArray[i].hardware.longitude + ", " + deviceArray[i].hardware.latitude + ", 0")


            deviceArray[i]["kml_url"] = base_url + "uploads/" + userId + "_" + ruasJalan + ".kml";
            deviceArray[i]["kml_filename"] = userId + "_" + ruasJalan + ".kml";
            newDeviceArray.push(deviceArray[i])

        }


        var doc = kml.end({ pretty: true });


        var xmldoc = kml.toString({ pretty: true });

        var dirPath = "./uploads/" + userId + "_" + ruasJalan + ".kml";

        fs.writeFile(dirPath, xmldoc, function(err) {
            if (err) { return console.log(err); }
            console.log("The file was saved!");

            res.status(200).json({
                count: newDeviceArray.length,
                result: newDeviceArray,
            })

        });
    }

    function checkDeviceIsActive(hardware) {
        var isActive = false;
        if (hardware != null) {
            if (hardware.lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = hardware.lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // console.log(dateNow + "    " + dateLastUpdate);

                    if (diffTime < 180000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        if (hardware.hardwareId == "B251") {
            console.log("B251 " + isActive)
        }


        return isActive;
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
                    referal: user.referal,
                    ruasJalan: req.body.ruasJalan,
                    referalFrom: user.referalFrom,
                    referalFrom2: user.referalFrom2,
                    referalRuasFrom: req.body.referalRuasFrom
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

exports.devices_get_street = (req, res, next) => {
    var query = req.body.query;
    var referal = req.body.referal;
    if (query === "0") {
        Device.find()
            .exec()
            .then((devices) => {
                var ruasJalan = [];
                loop1: for (var i = 0; i < devices.length; i++) {
                    if (devices[i].ruasJalan != null) {
                        loop2: for (var j = 0; j < ruasJalan.length; j++) {
                            if (devices[i].ruasJalan == ruasJalan[j].ruasJalan) {
                                continue loop1;
                            }
                        }
                        ruasJalan.push(devices[i]);
                    }
                }
                res.status(200).json(
                    ruasJalan
                )
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });

    } else {
        Device.find()
            .exec()
            .then((devices) => {
                var newDevices = [];
                loop1: for (var i = 0; i < devices.length; i++) {
                    if (devices[i].ruasJalan == null) continue;
                    loop2: for (var j = 0; j < newDevices.length; j++) {
                        if (devices[i].ruasJalan == newDevices[j].ruasJalan) {
                            continue loop1;
                        }
                    }

                    if (devices[i].ruasJalan.toLowerCase().includes(query.toLowerCase())) {
                        newDevices.push(devices[i]);
                    }
                }
                res.status(200).json(
                    newDevices
                )
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    }



}