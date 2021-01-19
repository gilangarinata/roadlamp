const http = require('http');
const app = require('./app');
const cron = require('node-cron');
const Schedule = require("./api/models/schedule");
const Hardware = require("./api/models/hardware");

const port = 8000;

const server = http.createServer(app);
process.env.TZ = 'Asia/Jakarta'

cron.schedule('*/2 * * * * *', function() {
    Schedule.find()
        .exec()
        .then(schedules => {
            var datetime = new Date();
            const minutesNow = datetime.getMinutes();
            const hoursNow = datetime.getHours();

            for (var i = 0; i < schedules.length; i++) {
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

server.listen(port);