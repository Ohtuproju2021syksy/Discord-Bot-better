const { updateGuide } = require("../services/service");
const { removeUserFromDb } = require("../services/userService");

const execute = async (member, client, models) => {
  await updateGuide(client.guild, models.Course);
  await removeUserFromDb(member.user.id, models.User)
};

module.exports = {
  name: "guildMemberRemove",
  execute,
};