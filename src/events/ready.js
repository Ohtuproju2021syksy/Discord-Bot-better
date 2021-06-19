const Discord = require("discord.js");
const { initializeApplicationContext } = require("../init");

const initSlashCommands = (client) => {
  client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.post({
    data: {
      name: "hello",
      description: "hello world command",
      // possible options here e.g. options: [{...}]
    },
  });
};

const execute = async (client) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  client.guild.invites = new Discord.Collection();
  client.guild.inv = await client.guild.fetchInvites();
  initializeApplicationContext(client);
  initSlashCommands(client);
  console.log(`Logged in as ${client.user.tag}!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
