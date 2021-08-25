const { reloadCommands } = require("../utils");

const execute = async (message, args) => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    reloadCommands(message.client, args);
  }
};

module.exports = {
  prefix: true,
  name: "reloadcommands",
  description: "Reload slash commands",
  role: "admin",
  usage: "!reloadcommands [command names]",
  args: true,
  execute,
};
