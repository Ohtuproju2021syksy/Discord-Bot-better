const { createLogger, format, transports } = require("winston");
const { PapertrailConnection, PapertrailTransport } = require("winston-papertrail");

let logger;

if (process.env.NODE_ENV !== "test") {
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


  logger = createLogger({
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

  winstonPapertrail.on("connect", function() {
    logger.info("Logger connected to Papertrail");
});
}

const logError = (error) => {
  if (logger) {
    logger.error(error);
  }
};

module.exports = {
  logError,
};
