require("./db/index");
const startDiscordBot = require("./discordBot/index");
const startServer = require("./server/server");
const startBridge = require("./discordBot/bridge");
const { client } = startDiscordBot;

startServer(client);
startBridge(client);
