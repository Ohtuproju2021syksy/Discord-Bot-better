require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");

process.env.TG_BRIDGE_ENABLED && require("../bridge.js");

const token = process.env.BOT_TOKEN;

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync("./src/discordBot/commands");
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/discordBot/commands/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

const eventFiles = fs.readdirSync("./src/discordBot/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.ws) {
    client.ws.on(event.name, async (interaction) => {
      event.execute(interaction, client);
    });
  }
  else if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

const login = async () => {
<<<<<<< HEAD
<<<<<<< HEAD
  await client.login(token);
=======
  startServer(await client.login(token));
>>>>>>> 62405ef (Refactor project applications into your own directories)
=======
  await client.login(token);
  startServer(client);
>>>>>>> b6b2444 (Fix server start)
};

if (process.env.NODE_ENV !== "test") {
  login();
}

module.exports = {
  login,
  client,
};
