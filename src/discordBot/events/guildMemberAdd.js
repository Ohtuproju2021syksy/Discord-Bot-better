const { updateGuide } = require("../services/service");

const execute = async (member, client, models) => {
  await updateGuide(client.guild, models.Course);
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};