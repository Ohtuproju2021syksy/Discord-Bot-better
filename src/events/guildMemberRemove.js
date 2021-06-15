const { updateGuide } = require("../service");

const execute = async (member, client) => {
  if (member.user.bot) return;
  await updateGuide(client.guild);
};

module.exports = {
  name: "guildMemberRemove",
  execute,
};