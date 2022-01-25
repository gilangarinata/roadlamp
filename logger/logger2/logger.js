 /**
  * Configurations of logger.
  */
 const winston = require('winston');
 const winstonRotator = require('winston-daily-rotate-file');

 //   const consoleConfig = [
 //     new winston.transports.Console({
 //       'colorize': true
 //     })
 //   ];

 //   const createLogger = new winston.Logger({
 //     'transports': consoleConfig
 //   });

 const successLogger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     json: true,
     defaultMeta: { service: 'user-service' },
     transports: [
         //
         // - Write all logs with level `error` and below to `error.log`
         // - Write all logs with level `info` and below to `combined.log`
         //
         new winston.transports.File({ filename: './logs/access.log', level: 'info' }),
         new winston.transports.File({ filename: 'combined.log' }),
         new winston.transports.Console({
             'colorize': true
         })
     ],
 });

 //   successLogger.add(winstonRotator, {
 //     'name': 'access-file',
 //     'level': 'info',
 //     'filename': './logs/access.log',
 //     'json': false,
 //     'datePattern': 'yyyy-MM-dd-',
 //     'prepend': true
 //   });

 //   const errorLogger = createLogger;
 //   errorLogger.add(winstonRotator, {
 //     'name': 'error-file',
 //     'level': 'error',
 //     'filename': './logs/error.log',
 //     'json': false,
 //     'datePattern': 'yyyy-MM-dd-',
 //     'prepend': true
 //   });

 module.exports = {
     'successlog': successLogger
         // 'errorlog': errorLogger
 };