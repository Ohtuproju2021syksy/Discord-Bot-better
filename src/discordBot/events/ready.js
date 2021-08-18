const { initializeApplicationContext } = require("../services/init");
const { initCommands } = require("../commands/utils");

const execute = async (client, Course) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  await initializeApplicationContext(client);
  await initCommands(client, Course);
  console.log(`${client.user.tag} initialized!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
