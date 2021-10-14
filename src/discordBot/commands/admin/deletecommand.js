const { deleteCommand } = require("../../services/service");

const execute = async (message, args) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const client = message.client;
    await deleteCommand(client, args[0]);
  }
};

module.exports = {
  prefix: true,
  name: "deletecommand",
  description: "Delete a slash command.",
  role: "admin",
  usage: "!deletecommand [command name]",
  args: true,
  execute,
};
