const { createLogger, format, transports } = require("winston");
const { PapertrailConnection, PapertrailTransport } = require("winston-papertrail");

const winstonPapertrail = new PapertrailConnection({
  host: "logs2.papertrailapp.com",
  port: 10737,
});


const paperTrailTransport = new PapertrailTransport(winstonPapertrail);


const errorStackTracerFormat = format(info => {
  if (info.stack) {
    info.message = `${info.message} ${info.stack}`;
  }
  return info;
});


const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.colorize(),
    errorStackTracerFormat(),
    format.simple(),
  ),
  transports: [ paperTrailTransport ],
});

if (process.env.NODE_ENV === "development") {
  logger.add(new transports.Console({
    format: format.simple(),
  }));
  logger.remove(paperTrailTransport);
}

const logError = (error) => {
  logger.error(error);
};

module.exports = {
  logError,
};
