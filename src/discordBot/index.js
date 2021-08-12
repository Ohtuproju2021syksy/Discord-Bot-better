require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");
const { Groups } = require("../db/dbInit");
const { Course } = require("../db/dbInit");

const token = process.env.BOT_TOKEN;

const client = new Discord.Client();

const eventFiles = fs.readdirSync("./src/discordBot/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.ws) {
    client.ws.on(event.name, async (interaction) => {
      event.execute(interaction, client, Groups, Course);
    });
  }
  else if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args, client, Groups, Course));
  }
}

const login = async () => {
  await client.login(token);
};

if (process.env.NODE_ENV !== "test") {
  login();
}

module.exports = {
  login,
  client,
};
