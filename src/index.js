require("dotenv").config();
const { sequelize } = require("./db/index");
const startServer = require("./server/server");
const { client, startDiscordBot } = require("./discordBot/index");
const { telegramClient, startTelegramBot } = require("./telegramBot/index");
const { startBridge } = require("./bridge/index");

const start = async () => {
  if (process.env.TG_BRIDGE_ENABLED) await startTelegramBot();
  await startDiscordBot();
  startServer(sequelize);
  startBridge(client, telegramClient);
};

start();