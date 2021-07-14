require("./db/index");
const startDiscordBot = require("./discordBot/index");
const startServer = require("./server/server");
const { client } = startDiscordBot;

startServer(client);
