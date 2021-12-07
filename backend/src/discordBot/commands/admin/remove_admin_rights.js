const { findUserByDiscordId } = require("../../../db/services/userService");
const { confirmChoiceNoInteraction } = require("../../services/confirm");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.guild;
    const userId = args[0];

    const user = await findUserByDiscordId(userId, models.User);

    if (!user) {
      return message.reply(`Error: no user found with the id ${userId}.`);
    }

    const confirm = await confirmChoiceNoInteraction(message, "Remove admin rights from " + user.name, guild);
    if (!confirm) {
      return;
    }

    user.admin = false;
    await user.save();

  }
};

module.exports = {
  prefix: true,
  name: "remove_admin_rights",
  description: "Remove admin rights from a user.",
  role: "admin",
  usage: "!remove_admin_rights [user's Discord id]",
  args: true,
  execute,
};