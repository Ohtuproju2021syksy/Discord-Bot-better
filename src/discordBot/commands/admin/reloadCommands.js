const { setUpCommands } = require("../../services/command");

const execute = async (message, args, Course) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    setUpCommands(message.client, Course);
  }
};

module.exports = {
  prefix: true,
  name: "reloadcommands",
  description: "Reload slash commands.",
  role: "admin",
  usage: "!reloadcommands",
  args: false,
  execute,
};
