require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Groups } = require("../db/dbInit");
const fs = require("fs");

const telegramClient = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
telegramClient.command("quit", (ctx) => {
  console.log("quit");
  ctx.telegram.leaveChat(ctx.message.chat.id);
});

// Enable graceful stop
process.once("SIGINT", () => telegramClient.stop("SIGINT"));
process.once("SIGTERM", () => telegramClient.stop("SIGTERM"));

const eventFiles = fs.readdirSync("./src/telegramBot/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  telegramClient.on(event.name, (...args) => {
    try {
      event.execute(...args, telegramClient, Groups);
    }
    catch (error) {
      console.log(error);
    }
  });
}

const start = () => {
  telegramClient.launch();
  console.log("Telegram bot launched");
};

module.exports = {
  start,
  telegramClient,
};