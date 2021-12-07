const { initializeApplicationContext } = require("../services/init");
const { setUpCommands } = require("../services/command");

const execute = async (client, models) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  await initializeApplicationContext(client, models);
  await setUpCommands(client, models.Course);
  client.guild.members.fetch();
  console.log(`${client.user.tag} initialized!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
