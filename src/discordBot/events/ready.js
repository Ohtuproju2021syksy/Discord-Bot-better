const { initializeApplicationContext } = require("../services/init");
const { setUpCommands } = require("../services/command");

const execute = async (client, Course) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  await initializeApplicationContext(client, Course);
  await setUpCommands(client, Course);
  console.log(`${client.user.tag} initialized!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
