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

cron.schedule('*/10 * * * * *', function() {
    var options = {
        'method': 'POST',
        'url': 'http://vlrs2.savvi.id:3008/hardware/v3',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "a": "123", "b": "3", "c": "2", "d": "34.3", "e": "100", "f": "T0001" })

    };
    request(options, function(error, response) {
        if (error) console.log("CRON ERROR : " + error);
        console.log("CRON : " + response);
    });
});


server.listen(port);