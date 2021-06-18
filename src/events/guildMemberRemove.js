const { updateGuide } = require("../service");

const execute = async (member, client) => {
  if (member.user.bot) {
    const studentRole = await client.guild.roles.cache.find((r) => r.name === "student");
    await member.roles.remove(studentRole);
    return;
  }
  await updateGuide(client.guild);
};

module.exports = {
  name: "guildMemberRemove",
  execute,
};