const { updateGuide } = require("../services/service");

const execute = async (member, client, Course) => {
  await updateGuide(client.guild, Course);
};

module.exports = {
  name: "guildMemberRemove",
  execute,
};