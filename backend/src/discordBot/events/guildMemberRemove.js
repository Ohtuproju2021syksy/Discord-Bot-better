const { updateGuide } = require("../../discordBot/services/service");
const { removeUserFromDb } = require("../../db/services/userService");

const execute = async (member, client, models) => {
  await updateGuide(client.guild, models);
  await removeUserFromDb(member.user.id, models.User);
};

module.exports = {
  name: "guildMemberRemove",
  execute,
};