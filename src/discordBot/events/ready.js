const { initializeApplicationContext } = require("../services/init");
const { initCommands } = require("../slash_commands/utils");

const execute = async (client) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  await initializeApplicationContext(client);
  await initCommands(client);
  console.log(`Logged in as ${client.user.tag}!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
