const { getCourseNameFromCategory } = require("../../services/service");

const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const channels = message.guild.channels.cache.filter(c => c.type === "GUILD_CATEGORY" && c.name.includes("🔒"));
    channels.forEach(async channel => {
      await channel.setName(`👻 ${getCourseNameFromCategory(channel)}`);
    });
  }
};

module.exports = {
  prefix: true,
  name: "update_categorynames",
  description: "Updates category names to the new format",
  role: "admin",
  usage: "!update_categorynames",
  args: false,
  execute,
};