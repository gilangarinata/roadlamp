const Hardware = require("../models/hardware");
const mongoose = require("mongoose");
const { doc } = require("prettier");
const Schedule = require("../models/schedule")
const History = require("../models/history")
const Notification = require("../notif/firebase")
var cron = require('node-cron');
var lastNotif = "0";
const request = require('request');
const openWeatherKey = '815168ce4992ad1ee04830a8556bedf9';
// const errorLog = require('../../logger/logger').errorlog;
const successlog = require('../../logger/logger').successlog;


exports.hardware_get_all = (req, res, next) => {
    Hardware.find()
        .exec()
        .then(docs => {
            res.status(200).json({
                total: docs.length,
                orders: docs
            });
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
}

exports.update_lat_long = (req, res, next) => {
    Hardware.update({
        hardwareId: req.body.hid
    }, {
        $set: {
            latitude: req.body.lat,
            longitude: req.body.long
        }
    }).then(result => {
        res.status(200).json({
            message: 'success'
        });
    }).catch(e => {
        res.status(500).json({
            message: 'failed'
        });
    });
}

exports.hardware_update_hardware_v2 = (req, res, next) => {
    var keys = [];
    var i = 0;
    var resultObj = {};
    for (var key in req.body) {
        keys.push(key);
    }


    // console.log("===========");
    // console.log(keys);
    // console.log("===========");

    var apHid = "";

    var pInts = [];
    var centerHid = -1;


    for (var j = 0; j < keys.length; j++) {
        var pInt = 0;
        if (keys[j].includes('A')) {
            pInt = parseInt(keys[j].replace("A", ""));
        } else if (keys[j].includes('B')) {
            pInt = parseInt(keys[j].replace("B", ""));
        } else if (keys[j].includes('T')) {
            pInt = parseInt(keys[j].replace("T", ""));
        }

        pInts.push(pInt)
    }

    centerHid = Math.min.apply(null, pInts);

    for (var j = 0; j < keys.length; j++) {
        var pInt = 0;
        if (keys[j].includes('A')) {
            pInt = parseInt(keys[j].replace("A", ""));
        } else if (keys[j].includes('B')) {
            pInt = parseInt(keys[j].replace("B", ""));
        } else if (keys[j].includes('T')) {
            pInt = parseInt(keys[j].replace("T", ""));
        }

        if (pInt == centerHid) {
            apHid = keys[j];
        }
    }

    updateHardware(req.body[keys[i]].hardwareId);

    function updateHardware(hardwareId) {
        console.log("apHid : " + apHid + "------------" + "hid : " + hardwareId);

        Hardware.find({ hardwareId }).exec().then(resultHardware => {
            var temperature = "-";
            var humidity = "-";
            if (resultHardware.length > 0) {
                const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + resultHardware[0].latitude + '&lon=' + resultHardware[0].longitude + '&appid=' + openWeatherKey + '&units=metric';
                request(uri, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var obj = JSON.parse(response.body);
                        var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                        var humidityOwm = obj.main.humidity;

                        if (temperatureOwm != null) {
                            temperature = temperatureOwm;
                        }
                        if (humidityOwm != null) {
                            humidity = humidityOwm;
                        }
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    } else {
                        temperature = "-";
                        humidity = "-";
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    }
                });
            } else {
                const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + req.body[keys[i]].latitude + '&lon=' + req.body[keys[i]].longitude + '&appid=' + openWeatherKey + '&units=metric';
                request(uri, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var obj = JSON.parse(response.body);
                        var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                        var humidityOwm = obj.main.humidity;

                        if (temperatureOwm != null) {
                            temperature = temperatureOwm;
                        }
                        if (humidityOwm != null) {
                            humidity = humidityOwm;
                        }
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    } else {
                        temperature = "-";
                        humidity = "-";
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    }
                });
            }



        }).catch(err => {
            console.log(err)
        });
    }


    function updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid) {
        //add new hardware if hardwareId doesn't exist
        if (resultHardware.length < 1) {
            var connectedTo = "";
            if (apHid == hardwareId) {
                connectedTo = "AP";
            } else {
                connectedTo = apHid;
            }
            const hardware = new Hardware({
                _id: new mongoose.Types.ObjectId(),
                name: req.body[keys[i]].name,
                capacity: Number(req.body[keys[i]].capacity),
                chargingTime: Number(req.body[keys[i]].chargingTime),
                dischargingTime: req.body[keys[i]].dischargingTime,
                betteryHealth: Number(req.body[keys[i]].betteryHealth),
                alarm: req.body[keys[i]].alarm,
                longitude: req.body[keys[i]].longitude,
                latitude: req.body[keys[i]].latitude,
                hardwareId: req.body[keys[i]].hardwareId,
                temperature: temperature,
                humidity: humidity,
                connectedTo: connectedTo
            });

            hardware.save().then(result => {
                res.status(200).json({
                    message: 'New Hardware Created.'
                });
            }).catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            });

        } else {
            var isActive = false;
            var connectedTo = "";
            if (apHid == hardwareId) {
                connectedTo = "AP";
            } else {
                connectedTo = apHid;
            }

            if (resultHardware[0].lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = resultHardware[0].lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // console.log(diffTime + " milliseconds");
                    // console.log(diffDays + " days");
                    //1800000
                    if (diffTime < 180000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }


            const hardware = new Hardware({
                name: req.body[keys[i]].name,
                capacity: Number(req.body[keys[i]].capacity),
                chargingTime: Number(req.body[keys[i]].chargingTime),
                dischargingTime: req.body[keys[i]].dischargingTime,
                betteryHealth: Number(req.body[keys[i]].betteryHealth),
                alarm: req.body[keys[i]].alarm,
                longitude: req.body[keys[i]].longitude,
                latitude: req.body[keys[i]].latitude,
                photoPath: resultHardware[0].photoPath,
                lastUpdate: new Date(),
                active: isActive,
                temperature: temperature,
                humidity: humidity,
                connectedTo: connectedTo
            });

            // successlog.info("====================================");
            // successlog.info("DATE : " + new Date());
            // successlog.info("HID : " + hardwareId);
            // successlog.info("LAT : " + req.body[keys[i]].latitude);
            // successlog.info("LONG : " + req.body[keys[i]].longitude);
            // successlog.info("====================================");

            Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
                Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
                    var sch = schedule.sort(function(a, b) {
                        var dateA = new Date("01/01/2020" + " " + String(a.hour) + ":" + String(a.minute) + ":00");
                        var dateB = new Date("01/01/2020" + " " + String(b.hour) + ":" + String(b.minute) + ":00");
                        return dateA - dateB;
                    });

                    var alarm = resultHardware[0].alarm;

                    if (lastNotif === "0" && resultHardware[0].alarm != "0") {
                        if (alarm === "1") showNotif("Lampu Tidak Menyala")
                        else if (alarm === "2") showNotif("Solar Cell atau MPPT Rusak")
                        else if (alarm === "3") showNotif("Baterai Short")
                        else if (alarm === "4") showNotif("Baterai Habis / Baterai Rusak")
                        else if (alarm === "5") showNotif("Sistem Failure")
                        lastNotif = resultHardware[0].alarm;
                    } else if (lastNotif != "0" && resultHardware[0].alarm === "0") {
                        lastNotif = "0";
                    }

                    function showNotif(message) {
                        var payload = {
                            notification: {
                                title: "Pemberitahuan Device ID : " + resultHardware[0].hardwareId,
                                body: message
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
                    }

                    resultObj[hardwareId] = {
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
                    }
                    i++;
                    if (i < keys.length) {
                        updateHardware(req.body[keys[i]].hardwareId);
                    } else {
                        res.status(200).json(resultObj);
                    }
                }).catch(err => {
                    console.log(err)
                });
            }).catch(err => {
                console.log(err)
            });
        }
    }

}

exports.hardware_update_hardware_v3 = (req, res, next) => {
    console.log("======body=====");
    console.log(req.body);
    console.log("===========");

    var hardwareId = req.body.f;


    Hardware.find({ hardwareId }).exec().then(resultHardware => {
        var temperature = "-";
        var humidity = "-";
        if (resultHardware.length > 0) {
            const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + resultHardware[0].latitude + '&lon=' + resultHardware[0].longitude + '&appid=' + openWeatherKey + '&units=metric';
            request(uri, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(response.body);
                    var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                    var humidityOwm = obj.main.humidity;

                    if (temperatureOwm != null) {
                        temperature = temperatureOwm;
                    }
                    if (humidityOwm != null) {
                        humidity = humidityOwm;
                    }
                    updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId);
                } else {
                    temperature = "-";
                    humidity = "-";
                    updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId);
                }
            });
        } else {
            const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + 0.0 + '&lon=' + 0.0 + '&appid=' + openWeatherKey + '&units=metric';
            request(uri, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(response.body);
                    var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                    var humidityOwm = obj.main.humidity;

                    if (temperatureOwm != null) {
                        temperature = temperatureOwm;
                    }
                    if (humidityOwm != null) {
                        humidity = humidityOwm;
                    }
                    updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId);
                } else {
                    temperature = "-";
                    humidity = "-";
                    updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId);
                }
            });
        }

    }).catch(err => {
        console.log(err)
    });

    function updateHistory() {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        var date = year + '-' + month + '-' + day;
        var chargeCapacity = req.body.d;
        var dischargeCapacity = req.body.e;
        var batteryCapacity = 0;
        var batteryLife = 0;
        var hardwareId = req.body.f;

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
                    console.log("history update success");
                }).catch((err) => {
                    res.status(500).json({
                        error: err,
                    });
                });
            } else {
                // console.log(historyUpdate)
                historyAdd.save().then(result => {
                    console.log("new history created");
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


    function updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId) {
        //add new hardware if hardwareId doesn't exist
        if (resultHardware.length < 1) {
            var capacity = req.body.a;
            var chargingTime = req.body.b;
            var dischargingTime = req.body.c;
            var batteryHealth = 100;
            var batteryHealthDecimal = "100.00000";

            const hardware = new Hardware({
                _id: new mongoose.Types.ObjectId(),
                name: "",
                capacity: Number(capacity),
                chargingTime: Number(chargingTime),
                dischargingTime: dischargingTime,
                betteryHealth: batteryHealth,
                alarm: "0",
                longitude: "0.0",
                latitude: "0.0",
                hardwareId: hardwareId,
                temperature: temperature,
                humidity: humidity,
                connectedTo: "-",
                batteryHealthDecimal: batteryHealthDecimal
            });

            updateHistory();

            hardware.save().then(result => {
                res.status(200).json({
                    message: 'New Hardware Created.'
                });
            }).catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            });

        } else {
            updateHistory();

            if (resultHardware[0].lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = resultHardware[0].lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // console.log(diffTime + " milliseconds");
                    // console.log(diffDays + " days");
                    //1800000
                    if (diffTime < 180000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }


            var capacity = req.body.a;
            var chargingTime = req.body.b;
            var dischargingTime = req.body.c;
            var d = new Date();
            var currentDay = d.getDate();
            var lastDay = resultHardware[0].lastUpdate.getDate();
            var betteryHealth = 100;
            var batteryHealthDecimal = "100.00000";
            if (currentDay != lastDay) {
                var betteryHealthDec = parseFloat(resultHardware[0].batteryHealthDecimal) - 0.00001;
                batteryHealthDecimal = betteryHealthDec.toString();
                batteryHealth = parseInt(betteryHealthDec);
            } else {
                betteryHealth = resultHardware[0].betteryHealth
            }

            const hardware = new Hardware({
                name: "",
                capacity: Number(capacity),
                chargingTime: Number(chargingTime),
                dischargingTime: dischargingTime,
                betteryHealth: betteryHealth,
                alarm: "0",
                longitude: resultHardware[0].longitude,
                latitude: resultHardware[0].latitude,
                lastUpdate: new Date(),
                hardwareId: hardwareId,
                temperature: temperature,
                humidity: humidity,
                connectedTo: "-",
                batteryHealthDecimal: batteryHealthDecimal
            });

            Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
                res.status(200).json({
                    lamp: resultHardware[0].lamp != null ? resultHardware[0].lamp : false,
                });
            }).catch(err => {
                console.log(err)
            });
        }
    }

}

exports.hardware_update_hardware_v2_dev = (req, res, next) => {

    console.log("======body=====");
    console.log(req.body);
    console.log("===========");

    // res.status(200).json({
    //     message: 'testing'
    // });

    var keys = [];
    var i = 0;
    var resultObj = {};
    for (var key in req.body) {
        keys.push(key);
    }



    var apHid = "";

    var pInts = [];
    var centerHid = -1;


    for (var j = 0; j < keys.length; j++) {
        var pInt = 0;
        if (keys[j].includes('A')) {
            pInt = parseInt(keys[j].replace("A", ""));
        } else if (keys[j].includes('B')) {
            pInt = parseInt(keys[j].replace("B", ""));
        } else if (keys[j].includes('T')) {
            pInt = parseInt(keys[j].replace("T", ""));
        }

        pInts.push(pInt)
    }

    centerHid = Math.min.apply(null, pInts);

    for (var j = 0; j < keys.length; j++) {
        var pInt = 0;
        if (keys[j].includes('A')) {
            pInt = parseInt(keys[j].replace("A", ""));
        } else if (keys[j].includes('B')) {
            pInt = parseInt(keys[j].replace("B", ""));
        } else if (keys[j].includes('T')) {
            pInt = parseInt(keys[j].replace("T", ""));
        }

        if (pInt == centerHid) {
            apHid = keys[j];
        }
    }

    updateHardware(req.body[keys[i]].hardwareId);

    function updateHardware(hardwareId) {
        console.log("apHid : " + apHid + "------------" + "hid : " + hardwareId);

        Hardware.find({ hardwareId }).exec().then(resultHardware => {
            var temperature = "-";
            var humidity = "-";
            if (resultHardware.length > 0) {
                const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + resultHardware[0].latitude + '&lon=' + resultHardware[0].longitude + '&appid=' + openWeatherKey + '&units=metric';
                request(uri, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var obj = JSON.parse(response.body);
                        var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                        var humidityOwm = obj.main.humidity;

                        if (temperatureOwm != null) {
                            temperature = temperatureOwm;
                        }
                        if (humidityOwm != null) {
                            humidity = humidityOwm;
                        }
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    } else {
                        temperature = "-";
                        humidity = "-";
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    }
                });
            } else {
                const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + req.body[keys[i]].latitude + '&lon=' + req.body[keys[i]].longitude + '&appid=' + openWeatherKey + '&units=metric';
                request(uri, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var obj = JSON.parse(response.body);
                        var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                        var humidityOwm = obj.main.humidity;

                        if (temperatureOwm != null) {
                            temperature = temperatureOwm;
                        }
                        if (humidityOwm != null) {
                            humidity = humidityOwm;
                        }
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    } else {
                        temperature = "-";
                        humidity = "-";
                        updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid);
                    }
                });
            }



        }).catch(err => {
            console.log(err)
        });
    }


    function updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId, apHid) {
        //add new hardware if hardwareId doesn't exist
        if (resultHardware.length < 1) {
            var connectedTo = "";
            if (apHid == hardwareId) {
                connectedTo = "AP";
            } else {
                connectedTo = apHid;
            }
            const hardware = new Hardware({
                _id: new mongoose.Types.ObjectId(),
                name: req.body[keys[i]].name,
                capacity: Number(req.body[keys[i]].capacity),
                chargingTime: Number(req.body[keys[i]].chargingTime),
                dischargingTime: req.body[keys[i]].dischargingTime,
                betteryHealth: Number(req.body[keys[i]].betteryHealth),
                alarm: req.body[keys[i]].alarm,
                longitude: req.body[keys[i]].longitude,
                latitude: req.body[keys[i]].latitude,
                hardwareId: req.body[keys[i]].hardwareId,
                temperature: temperature,
                humidity: humidity,
                connectedTo: connectedTo
            });

            hardware.save().then(result => {
                res.status(200).json({
                    message: 'New Hardware Created.'
                });
            }).catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            });

        } else {
            var isActive = false;
            var connectedTo = "";
            if (apHid == hardwareId) {
                connectedTo = "AP";
            } else {
                connectedTo = apHid;
            }

            if (resultHardware[0].lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = resultHardware[0].lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // console.log(diffTime + " milliseconds");
                    // console.log(diffDays + " days");
                    //1800000
                    if (diffTime < 180000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }


            const hardware = new Hardware({
                name: req.body[keys[i]].name,
                capacity: Number(req.body[keys[i]].capacity),
                chargingTime: Number(req.body[keys[i]].chargingTime),
                dischargingTime: req.body[keys[i]].dischargingTime,
                betteryHealth: Number(req.body[keys[i]].betteryHealth),
                alarm: req.body[keys[i]].alarm,
                longitude: req.body[keys[i]].longitude,
                latitude: req.body[keys[i]].latitude,
                photoPath: resultHardware[0].photoPath,
                lastUpdate: new Date(),
                active: isActive,
                temperature: temperature,
                humidity: humidity,
                connectedTo: connectedTo
            });

            // successlog.info("====================================");
            // successlog.info("DATE : " + new Date());
            // successlog.info("HID : " + hardwareId);
            // successlog.info("LAT : " + req.body[keys[i]].latitude);
            // successlog.info("LONG : " + req.body[keys[i]].longitude);
            // successlog.info("====================================");

            Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
                Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
                    var sch = schedule.sort(function(a, b) {
                        var dateA = new Date("01/01/2020" + " " + String(a.hour) + ":" + String(a.minute) + ":00");
                        var dateB = new Date("01/01/2020" + " " + String(b.hour) + ":" + String(b.minute) + ":00");
                        return dateA - dateB;
                    });

                    var alarm = resultHardware[0].alarm;

                    if (lastNotif === "0" && resultHardware[0].alarm != "0") {
                        if (alarm === "1") showNotif("Lampu Tidak Menyala")
                        else if (alarm === "2") showNotif("Solar Cell atau MPPT Rusak")
                        else if (alarm === "3") showNotif("Baterai Short")
                        else if (alarm === "4") showNotif("Baterai Habis / Baterai Rusak")
                        else if (alarm === "5") showNotif("Sistem Failure")
                        lastNotif = resultHardware[0].alarm;
                    } else if (lastNotif != "0" && resultHardware[0].alarm === "0") {
                        lastNotif = "0";
                    }

                    function showNotif(message) {
                        var payload = {
                            notification: {
                                title: "Pemberitahuan Device ID : " + resultHardware[0].hardwareId,
                                body: message
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
                    }

                    resultObj[hardwareId] = {
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
                    }
                    i++;
                    if (i < keys.length) {
                        updateHardware(req.body[keys[i]].hardwareId);
                    } else {
                        res.status(200).json(resultObj);
                    }
                }).catch(err => {
                    console.log(err)
                });
            }).catch(err => {
                console.log(err)
            });
        }
    }

}


exports.hardware_update_hardware = (req, res, next) => {
    const hardwareId = req.body.hardwareId;
    Hardware.find({ hardwareId }).exec().then(resultHardware => {
        var temperature = "-";
        var humidity = "-";
        if (resultHardware.length > 0) {
            const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + resultHardware[0].latitude + '&lon=' + resultHardware[0].longitude + '&appid=' + openWeatherKey + '&units=metric';
            request(uri, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(response.body);
                    var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                    var humidityOwm = obj.main.humidity;

                    if (temperatureOwm != null) {
                        temperature = temperatureOwm;
                    }
                    if (humidityOwm != null) {
                        humidity = humidityOwm;
                    }
                    updateHardware(resultHardware, temperature, humidity, req, res, hardwareId);
                } else {
                    temperature = "-";
                    humidity = "-";
                    updateHardware(resultHardware, temperature, humidity, req, res, hardwareId);
                }
            });
        } else {
            const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + req.body.latitude + '&lon=' + req.body.longitude + '&appid=' + openWeatherKey + '&units=metric';
            request(uri, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(response.body);
                    var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                    var humidityOwm = obj.main.humidity;

                    if (temperatureOwm != null) {
                        temperature = temperatureOwm;
                    }
                    if (humidityOwm != null) {
                        humidity = humidityOwm;
                    }
                    updateHardware(resultHardware, temperature, humidity, req, res, hardwareId);
                } else {
                    temperature = "-";
                    humidity = "-";
                    updateHardware(resultHardware, temperature, humidity, req, res, hardwareId);
                }
            });
        }



    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
}


function updateHardware(resultHardware, temperature, humidity, req, res, hardwareId) {
    // console.log(humidity + "  " + temperature);
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
            hardwareId: req.body.hardwareId,
            temperature: temperature,
            humidity: humidity
        });

        hardware.save().then(result => {
            res.status(200).json({
                message: 'New Hardware Created.'
            });
        }).catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });

    } else {
        var isActive = false;


        if (resultHardware[0].lastUpdate != null) {
            try {
                const dateNow = new Date();
                const dateLastUpdate = resultHardware[0].lastUpdate;
                const diffTime = Math.abs(dateNow - dateLastUpdate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                // console.log(diffTime + " milliseconds");
                // console.log(diffDays + " days");

                if (diffTime < 180000) { // if there is data updated less than 120 second 
                    isActive = true;
                }
            } catch (e) {
                console.log(e);
            }
        }


        const hardware = new Hardware({
            name: req.body.name,
            capacity: req.body.capacity,
            chargingTime: req.body.chargingTime,
            dischargingTime: req.body.dischargingTime,
            betteryHealth: req.body.betteryHealth,
            alarm: req.body.alarm,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            photoPath: resultHardware[0].photoPath,
            lastUpdate: new Date(),
            active: isActive,
            temperature: temperature,
            humidity: humidity
        });


        Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
            Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
                var sch = schedule.sort(function(a, b) {
                    var dateA = new Date("01/01/2020" + " " + String(a.hour) + ":" + String(a.minute) + ":00");
                    var dateB = new Date("01/01/2020" + " " + String(b.hour) + ":" + String(b.minute) + ":00");
                    return dateA - dateB;
                });

                var alarm = resultHardware[0].alarm;

                if (lastNotif === "0" && resultHardware[0].alarm != "0") {
                    if (alarm === "1") showNotif("Lampu Tidak Menyala")
                    else if (alarm === "2") showNotif("Solar Cell atau MPPT Rusak")
                    else if (alarm === "3") showNotif("Baterai Short")
                    else if (alarm === "4") showNotif("Baterai Habis / Baterai Rusak")
                    else if (alarm === "5") showNotif("Sistem Failure")
                    lastNotif = resultHardware[0].alarm;
                } else if (lastNotif != "0" && resultHardware[0].alarm === "0") {
                    lastNotif = "0";
                }

                function showNotif(message) {
                    var payload = {
                        notification: {
                            title: "Pemberitahuan Device ID : " + resultHardware[0].hardwareId,
                            body: message
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
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
    }
}

function updateHardwareV2(resultHardware, temperature, humidity, req, res, hardwareId) {
    console.log(humidity + "  " + temperature);
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
            hardwareId: req.body.hardwareId,
            temperature: temperature,
            humidity: humidity
        });

        hardware.save().then(result => {
            res.status(200).json({
                message: 'New Hardware Created.'
            });
        }).catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });

    } else {
        var isActive = false;


        if (resultHardware[0].lastUpdate != null) {
            try {
                const dateNow = new Date();
                const dateLastUpdate = resultHardware[0].lastUpdate;
                const diffTime = Math.abs(dateNow - dateLastUpdate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(diffTime + " milliseconds");
                console.log(diffDays + " days");

                if (diffTime < 180000) { // if there is data updated less than 120 second 
                    isActive = true;
                }
            } catch (e) {
                console.log(e);
            }
        }


        const hardware = new Hardware({
            name: req.body.name,
            capacity: req.body.capacity,
            chargingTime: req.body.chargingTime,
            dischargingTime: req.body.dischargingTime,
            betteryHealth: req.body.betteryHealth,
            alarm: req.body.alarm,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            photoPath: resultHardware[0].photoPath,
            lastUpdate: new Date(),
            active: isActive,
            temperature: temperature,
            humidity: humidity
        });


        Hardware.update({ hardwareId: hardwareId }, { $set: hardware }).exec().then(result => {
            Schedule.find({ hardwareId: hardwareId }).exec().then(schedule => {
                var sch = schedule.sort(function(a, b) {
                    var dateA = new Date("01/01/2020" + " " + String(a.hour) + ":" + String(a.minute) + ":00");
                    var dateB = new Date("01/01/2020" + " " + String(b.hour) + ":" + String(b.minute) + ":00");
                    return dateA - dateB;
                });

                var alarm = resultHardware[0].alarm;

                if (lastNotif === "0" && resultHardware[0].alarm != "0") {
                    if (alarm === "1") showNotif("Lampu Tidak Menyala")
                    else if (alarm === "2") showNotif("Solar Cell atau MPPT Rusak")
                    else if (alarm === "3") showNotif("Baterai Short")
                    else if (alarm === "4") showNotif("Baterai Habis / Baterai Rusak")
                    else if (alarm === "5") showNotif("Sistem Failure")
                    lastNotif = resultHardware[0].alarm;
                } else if (lastNotif != "0" && resultHardware[0].alarm === "0") {
                    lastNotif = "0";
                }

                function showNotif(message) {
                    var payload = {
                        notification: {
                            title: "Pemberitahuan Device ID : " + resultHardware[0].hardwareId,
                            body: message
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
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
    }
}


exports.hardware_get = (req, res, next) => {
    const id = req.params.id;
    Hardware.findById(id).exec().then(hardware => {
        const uri = 'http://api.openweathermap.org/data/2.5/weather?lat=' + hardware.latitude + '&lon=' + hardware.longitude + '&appid=' + openWeatherKey + '&units=metric';
        var isActive = false;

        if (hardware != null) {
            if (hardware.lastUpdate != null) {
                try {
                    const dateNow = new Date();
                    const dateLastUpdate = hardware.lastUpdate;
                    const diffTime = Math.abs(dateNow - dateLastUpdate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    console.log(diffTime + " milliseconds");
                    console.log(diffDays + " days");

                    if (diffTime < 180000) { // if there is data updated less than 120 second 
                        isActive = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        request(uri, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var temperature = "";
                var humidity = "";
                var obj = JSON.parse(response.body);
                var temperatureOwm = obj.main.temp; //Own = Open Weather Map
                var humidityOwm = obj.main.humidity;

                if (temperatureOwm != null) {
                    temperature = temperatureOwm;
                }
                if (humidityOwm != null) {
                    humidity = humidityOwm;
                }


                res.status(200).json({
                    result: {
                        _id: hardware._id,
                        capacity: hardware.capacity,
                        chargingTime: hardware.chargingTime,
                        dischargingTime: hardware.dischargingTime,
                        betteryHealth: hardware.betteryHealth,
                        alarm: hardware.alarm,
                        photoPath: hardware.photoPath,
                        name: hardware.name,
                        longitude: hardware.longitude,
                        latitude: hardware.latitude,
                        hardwareId: hardware.hardwareId,
                        temperature: temperature.toString(),
                        humidity: humidity.toString(),
                        lamp: hardware.lamp,
                        brightness: hardware.brightness,
                        isActive: isActive,
                        lastUpdate: hardware.lastUpdate,
                        connectedTo: hardware.connectedTo
                    },
                })
            } else {
                res.status(200).json({
                    result: {
                        _id: hardware._id,
                        capacity: hardware.capacity,
                        chargingTime: hardware.chargingTime,
                        dischargingTime: hardware.dischargingTime,
                        betteryHealth: hardware.betteryHealth,
                        alarm: hardware.alarm,
                        photoPath: hardware.photoPath,
                        name: hardware.name,
                        longitude: hardware.longitude,
                        latitude: hardware.latitude,
                        hardwareId: hardware.hardwareId,
                        temperature: "",
                        humidity: "",
                        lamp: hardware.lamp,
                        brightness: hardware.brightness,
                        isActive: isActive,
                        lastUpdate: hardware.lastUpdate,
                        connectedTo: hardware.connectedTo
                    },
                })

            }
        });

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
            // console.log(historyUpdate)
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

exports.hardware_update_history_v2 = (req, res, next) => {
    var keys = [];
    var i = 0;
    var resultObj = {};
    for (var key in req.body) {
        keys.push(key);
    }

    updateHistory();

    function updateHistory() {
        var date = req.body[keys[i]].date;
        var chargeCapacity = req.body[keys[i]].chargeCapacity;
        var dischargeCapacity = req.body[keys[i]].dischargeCapacity;
        var batteryCapacity = req.body[keys[i]].batteryCapacity;
        var batteryLife = req.body[keys[i]].batteryLife;
        var hardwareId = req.body[keys[i]].hardwareId;

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
                    i++;
                    if (i < keys.length) {
                        updateHistory();
                    } else {
                        res.status(200).json({
                            message: "History Update Success.",
                            code: 200
                        });
                    }
                }).catch((err) => {
                    console.log(err)
                    res.status(500).json({
                        error: err,
                    });
                });
            } else {
                console.log(historyUpdate)
                historyAdd.save().then(result => {
                    i++;
                    if (i < keys.length) {
                        updateHistory();
                    } else {
                        res.status(200).json({
                            message: "New history created.",
                            code: 200
                        });
                    }
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

exports.hardware_delete_all = (req, res, next) => {
    Hardware.deleteMany().exec().then(message => {
        res.status(200).json({
            message: message
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}