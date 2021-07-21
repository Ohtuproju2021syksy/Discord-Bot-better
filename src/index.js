const { sequelize } = require("./db/index");
const startDiscordBot = require("./discordBot/index");
const startBridge = require("./discordBot/bridge");
const startServer = require("./server/server");
const { client } = startDiscordBot;

if (process.env.TG_BRIDGE_ENABLED) {
  startBridge();
}
startServer(client, sequelize);
