const { updateGuide } = require("../../discordBot/services/service");
const { createUserToDatabase } = require("../../db/services/userService");

const execute = async (member, client, models) => {
  await updateGuide(client.guild, models);
  await createUserToDatabase(member.user.id, member.user.username, models.User);
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};