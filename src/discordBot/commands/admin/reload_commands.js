const { setUpCommands } = require("../../services/command");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    setUpCommands(message.client, models.Course);
  }
};

module.exports = {
  prefix: true,
  name: "reload_commands",
  description: "Reload slash commands.",
  role: "admin",
  usage: "!reload_commands",
  args: false,
  execute,
};
