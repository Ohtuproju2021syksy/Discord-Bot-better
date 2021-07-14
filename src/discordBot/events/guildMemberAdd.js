const { updateGuide } = require("../services/service");

const execute = async (member, client) => {
  await updateGuide(client.guild);
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};