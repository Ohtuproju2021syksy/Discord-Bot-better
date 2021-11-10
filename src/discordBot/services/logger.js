const winston = require('winston');
const { PapertrailConnection, PapertrailTransport } = require('winston-papertrail');

const winstonPapertrail = new PapertrailConnection({
  host: 'logs2.papertrailapp.com',
  port: 10737
});

const paperTrailTransport = new PapertrailTransport(winstonPapertrail);

const logger = new winston.createLogger({
  transports: [ paperTrailTransport ]
});

if (process.env.NODE_ENV === "development") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
  logger.remove(paperTrailTransport)
};

const logError = (error) => {
  logger.error(error);
};

module.exports = {
  logError
};