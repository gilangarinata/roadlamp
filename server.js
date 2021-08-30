const http = require('http');
const app = require('./app');
const cron = require('node-cron');
const Schedule = require("./api/models/schedule");
const Hardware = require("./api/models/hardware");
var request = require('request');

const port = 8000;

const server = http.createServer(app);
process.env.TZ = 'Asia/Jakarta'

cron.schedule('*/20 * * * * *', function() {
    Schedule.find()
        .exec()
        .then(schedules => {
            var datetime = new Date();
            const minutesNow = datetime.getMinutes();
            const hoursNow = datetime.getHours();

            for (var i = 0; i < schedules.length; i++) {
                // console.log(parseInt(schedules[i].hour) + "  " + hoursNow + " ====  " + parseInt(schedules[i].minute) + "   " + minutesNow);
                if (hoursNow === parseInt(schedules[i].hour)) {
                    if (minutesNow === parseInt(schedules[i].minute)) {
                        const hardwareId = schedules[i].hardwareId;
                        const brightness = schedules[i].brightness;
                        const updateOps = {
                            brightnessSchedule: brightness
                        }
                        Hardware.update({ hardwareId: hardwareId }, { $set: updateOps }).exec().then(result => {
                            console.log('success');
                        }).catch(err => {
                            console.log('failed');
                        });
                    }
                }
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
});

cron.schedule('*/50 * * * * *', function() {
    var options = {
        'method': 'POST',
        'url': 'http://localhost:8000/hardware/v3',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "a": "45", "b": "0", "c": "0.02", "d": "33", "e": "100", "f": "A0102" })


    };
    request(options, function(error, response) {
        if (error) console.log("CRON ERROR : " + error);
    });
});

cron.schedule('*/50 * * * * *', function() {
    var options = {
        'method': 'POST',
        'url': 'http://localhost:8000/hardware/v2',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "B0147": { "name": "SAVVI-B0206", "capacity": "100", "chargingTime": "0", "dischargingTime": "1.92", "betteryHealth": "100", "alarm": "0", "longitude": "107.617083", "latitude": "-6.371825", "hardwareId": "B0147", "date": "2070-01-01", "chargeCapacity": "0", "dischargeCapacity": "77.07", "batteryCapacity": "0", "batteryLife": "0" } })

        // {"B0206": {
        //       "name": "SAVVI-B0206",
        //       "capacity": "100",
        //       "chargingTime": "0",
        //       "dischargingTime": "1.92",
        //       "betteryHealth": "100",
        //       "alarm": "0",
        //       "longitude": "107.99540",
        //       "latitude": "-6.31461",
        //       "hardwareId": "B0165",
        //       "date": "2070-01-01",
        //       "chargeCapacity": "0",
        //       "dischargeCapacity": "77.07",
        //       "batteryCapacity": "0",
        //       "batteryLife": "0"
        //     }
        // }

    };
    request(options, function(error, response) {
        if (error) console.log("CRON ERROR : " + error);
    });
});

cron.schedule('*/50 * * * * *', function() {
    var options = {
        'method': 'POST',
        'url': 'http://localhost:8000/hardware/v2',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "B0165": { "name": "SAVVI-B0206", "capacity": "100", "chargingTime": "0", "dischargingTime": "1.92", "betteryHealth": "100", "alarm": "0", "longitude": "107.62376", "latitude": "-6.36785", "hardwareId": "B0165", "date": "2070-01-01", "chargeCapacity": "0", "dischargeCapacity": "77.07", "batteryCapacity": "0", "batteryLife": "0" } })

        // {"B0206": {
        //       "name": "SAVVI-B0206",
        //       "capacity": "100",
        //       "chargingTime": "0",
        //       "dischargingTime": "1.92",
        //       "betteryHealth": "100",
        //       "alarm": "0",
        //       "longitude": "107.99540",
        //       "latitude": "-6.31461",
        //       "hardwareId": "B0165",
        //       "date": "2070-01-01",
        //       "chargeCapacity": "0",
        //       "dischargeCapacity": "77.07",
        //       "batteryCapacity": "0",
        //       "batteryLife": "0"
        //     }
        // }

    };
    request(options, function(error, response) {
        if (error) console.log("CRON ERROR : " + error);
    });
});


cron.schedule('*/240 * * * * *', function() {
    var hids = ["A0101", "A0102", "A0103", "A0104", "A0105", "A0106", "A0107", "A0108", "A0109", "A0109", "A0110"];

    for (var i = 0; i < hids.length; i++) {
        var dischargingTime;
        var chargingTime;
        var date = new Date();
        var hour = date.getHours();

        console.log("========== HOUR : " + hour + "============");

        if (hour >= 6 && hour <= 17) {
            dischargingTime = "0.0";
            chargingTime = "1.9";
        } else {
            dischargingTime = "1.90";
            chargingTime = "0.0";
        }

        var hid = hids[i];

        var options = {
            'method': 'POST',
            'url': 'http://localhost:8000/hardware/v2',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hid: { "name": "SAVVI-B0206", "capacity": "100", "chargingTime": chargingTime, "dischargingTime": dischargingTime, "betteryHealth": "100", "alarm": "0", "longitude": "107.62376", "latitude": "-6.36785", "hardwareId": hid, "date": "2070-01-01", "chargeCapacity": "0", "dischargeCapacity": "77.07", "batteryCapacity": "0", "batteryLife": "0" } })

        };
        request(options, function(error, response) {
            if (error) console.log("CRON ERROR : " + error);
        });
    }
});


server.listen(port);