<<<<<<< HEAD
require("./db/index");
const startDiscordBot = require("./discordBot/index");
const startServer = require("./server/server");
const { client } = startDiscordBot;
=======
require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");
>>>>>>> a9dc541 (Update server)

startServer(client);
