require("./db/index");
const startDiscordBot = require("./discordBot/index");
const startServer = require("./server/server");
const startBridge = process.env.TG_BRIDGE_ENABLED && require("./discordBot/bridge");
const { client } = startDiscordBot;

startServer(client);
process.env.TG_BRIDGE_ENABLED && startBridge(client);
