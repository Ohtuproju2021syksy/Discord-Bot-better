const { initialChannels, commandsCategory } = require("../../config.json");

const execute = async (client) => {
  context = {};
  context.guild = await client.guilds.fetch(process.env.GUILD_ID);
  for (const channelName in initialChannels) {
    let channel = context.guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
    if (!channel) {
      channel = await createChannelInCategory(context.guild, channel, commandsCategory);
    }
    context[`${channel}`] = channel;
  }
  console.log(`Logged in as ${client.user.tag}!`);
};

module.exports = {
  name: "ready",
  once: true,
  execute,
};
