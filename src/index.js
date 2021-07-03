require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");

require("./bridge.js");

const token = process.env.BOT_TOKEN;
const { slashCommands, createSlashCommands } = require("./slash_commands/utils");

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync("./src/commands");
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.ws.on("INTERACTION_CREATE", async interaction => {
  const command = interaction.data.name.toLowerCase();
  slashCommands.find(c => c.name === command).execute(interaction);
});

client.on("COURSES_CHANGED", async () => {
  await createSlashCommands(client, ["join", "leave"]);
});

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
