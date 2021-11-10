const winston = require('winston');
const { PapertrailConnection, PapertrailTransport } = require('winston-papertrail');

const winstonPapertrail = new PapertrailConnection({
  host: 'logs2.papertrailapp.com',
  port: 10737
});

const logger = new winston.createLogger({
  transports: [ new PapertrailTransport(winstonPapertrail) ]
});

module.exports = logger;