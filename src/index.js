const { sequelize } = require("./db/index");
const startServer = require("./server/server");
const { client } = require("./discordBot/index");
const { telegramClient, start } = require("./telegramBot/index");
const { startBridge } = require("./bridge/index");

if (process.env.TG_BRIDGE_ENABLED) start();
startServer(client, sequelize);
startBridge(client, telegramClient);
