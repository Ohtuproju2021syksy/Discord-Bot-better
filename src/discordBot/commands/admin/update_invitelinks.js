const { updateInviteLinks } = require("../../services/service");

const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    await updateInviteLinks(message.guild);
  }
};

module.exports = {
  prefix: true,
  name: "update_invitelinks",
  description: "Update invitation links.",
  role: "admin",
  usage: "!update_invitelinks",
  args: false,
  execute,
};