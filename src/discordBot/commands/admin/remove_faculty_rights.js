const { findUserByDiscordId } = require("../../../db/services/userService");
const { confirmChoiceNoInteraction } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.guild;
    const userId = args[0];

    const user = await findUserByDiscordId(userId, models.User);

    if (!user) {
      return message.reply(`Error: no user found with the id ${userId}.`);
    }

    const confirm = await confirmChoiceNoInteraction(message, "Remove faculty rights from " + user.name, guild);
    if (!confirm) {
      return;
    }

    user.faculty = false;
    await user.save();

    const facultyRoleObject = guild.roles.cache.find(r => r.name === facultyRole);
    const userDisco = guild.members.cache.get(userId);
    userDisco.roles.remove(facultyRoleObject);
  }
};

module.exports = {
  prefix: true,
  name: "remove_faculty_rights",
  description: "Remove faculty rights from a user.",
  role: "admin",
  usage: "!remove_faculty_rights [user's Discord id]",
  args: true,
  execute,
};