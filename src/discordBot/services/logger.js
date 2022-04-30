const { createLogger, format, transports } = require("winston");
// const { PapertrailConnection, PapertrailTransport } = require("winston-papertrail");

let logger;

if (process.env.NODE_ENV !== "test") {
/*   const winstonPapertrail = new PapertrailConnection({
    host: process.env.PAPERTRAIL_URL,
    port: 10737,
  });

  const paperTrailTransport = new PapertrailTransport(winstonPapertrail);
 */

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
  });
  logger.add(new transports.Console({
    format: format.simple(),
  }));
/*   else if (process.env.NODE_ENV === "production") {
    logger.add(paperTrailTransport);
  }

  logger.rejections.handle(
    paperTrailTransport,
  );

  logger.exceptions.handle(
    paperTrailTransport,
  );

  winstonPapertrail.on("connect", function() {
    logger.info("Logger connected to Papertrail");
  }); */
}

const logError = (error) => {
  if (logger) {
    logger.error(error);
  }
};

const logInfo = (message) => {
  if (logger) {
    logger.info(message);
  }
};

const logInteractionError = (error, client, interaction) => {
  if (logger) {
    const member = client.guild.members.cache.get(interaction.member.user.id);
    const channel = client.guild.channels.cache.get(interaction.channelId);
    const msg = `ERROR DETECTED!\nMember: ${member.displayName}\nCommand: ${interaction.commandName}\nChannel: ${channel.name}}`;
    logger.error(msg);
    logger.error(error);
  }
};

const logNoInteractionError = async (telegramId, member, channel, client, error) => {
  if (logger) {
    const msg = `ERROR DETECTED!\nMember: ${member}\nChannel: ${channel}`;
    logger.error(msg);
    logger.error(error);
  }
};

module.exports = {
  logError, logInteractionError, logNoInteractionError, logInfo,
};
