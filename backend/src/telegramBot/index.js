require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Course } = require("../db/dbInit");
const fs = require("fs");
const { logError } = require("../discordBot/services/logger");

const telegramClient = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
telegramClient.command("quit", (ctx) => {
  console.log("quit");
  ctx.telegram.leaveChat(ctx.message.chat.id);
});

process.once("SIGINT", () => telegramClient.stop("SIGINT"));
process.once("SIGTERM", () => telegramClient.stop("SIGTERM"));

const eventFiles = fs.readdirSync("./src/telegramBot/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  telegramClient.on(event.name, (...args) => {
    try {
      event.execute(...args, telegramClient, Course);
    }
    catch (error) {
      logError(error);
      console.log(error);
    }
  });
}

const startTelegramBot = async () => {
  await telegramClient.launch();
  console.log("Telegram bot launched");
};

module.exports = {
  telegramClient,
  startTelegramBot,
};