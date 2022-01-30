require("dotenv").config();
const { Client, Intents } = require("discord.js");
const fs = require("fs");
const models = require("../db/dbInit");

const token = process.env.DISCORD_BOT_TOKEN;
const intents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_WEBHOOKS,
  Intents.FLAGS.GUILD_INVITES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_VOICE_STATES,
];
const client = new Client({ intents: intents });

const eventFiles = fs.readdirSync("./src/discordBot/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, models));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args, client, models));
  }
}

const startDiscordBot = async () => {
  await client.login(token);
  console.log("Discord bot logged in");
};

module.exports = {
  client,
  startDiscordBot,
};
