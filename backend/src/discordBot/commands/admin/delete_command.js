const { deletecommand } = require("../../services/service");

const execute = async (message, args) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const client = message.client;
    await deletecommand(client, args[0]);
  }
};

module.exports = {
  prefix: true,
  name: "delete_command",
  description: "Delete a slash command.",
  role: "admin",
  usage: "!delete_command [command name]",
  args: true,
  execute,
};
