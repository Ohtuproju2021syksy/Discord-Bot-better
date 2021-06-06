const { initializeApplicationContext } = require("../init");

const execute = async (client) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  initializeApplicationContext(client);
  console.log(`Logged in as ${client.user.tag}!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
