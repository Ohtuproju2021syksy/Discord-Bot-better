const { initializeApplicationContext } = require("../init");
const inviteCreate = require("./inviteCreate");

const execute = async (client) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  initializeApplicationContext(client);
  console.log(`Logged in as ${client.user.tag}!`);
  await inviteCreate.execute(client);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
