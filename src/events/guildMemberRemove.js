const { updateGuide } = require("../service");

const execute = async (member, client) => {
  await updateGuide(client.guild);
};

module.exports = {
  name: "guildMemberRemove",
  execute,
};