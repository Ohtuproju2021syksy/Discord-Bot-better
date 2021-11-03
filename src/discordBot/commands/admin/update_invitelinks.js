const { updateInviteLinks } = require("../../services/service");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    await updateInviteLinks(message.guild, courseAdminRole, facultyRole, message.client);
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