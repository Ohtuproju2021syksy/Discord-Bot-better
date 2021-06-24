const Discord = require("discord.js");
const { initializeApplicationContext } = require("../init");
const { initSlashCommands } = require("../slash_commands/utils");
const { sequelize } = require("../dbInit");

const execute = async (client) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  client.guild.invites = new Discord.Collection();
  client.guild.inv = await client.guild.fetchInvites();
  initializeApplicationContext(client);
  initSlashCommands(client);
  console.log(`Logged in as ${client.user.tag}!`);
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  }
  catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
