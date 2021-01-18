const http = require('http');
const app = require('./app');
const cron = require('node-cron');
const Schedule = require("./api/models/schedule");
const Hardware = require("./api/models/hardware");

const port = 8000;

const server = http.createServer(app);

cron.schedule('*/50 * * * * *', function() {
    Schedule.find()
        .exec()
        .then(schedules => {
            for (var i = 0; i < schedules.length; i++) {

                var datetime = new Date();
                const minutesNow = datetime.getMinutes();
                const hoursNow = datetime.getHours();

                if (hoursNow === Number(schedules[i].hour)) {
                    if (minutesNow === Number(schedules[i].minute)) {
                        const hardwareId = schedules[i].hardwareId;
                        const lamp = true;
                        const brightness = schedules[i].brightness;

                        const updateOps = {
                            lamp: lamp,
                            brightness: brightness
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

server.listen(port);