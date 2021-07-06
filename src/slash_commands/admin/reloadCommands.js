const { client } = require("../../index");
const { reloadCommands } = require("../utils");

const execute = async (message, args) => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    reloadCommands(client, args);
  }
};

module.exports = {
  prefix: true,
  name: "reloadcommands",
  description: "Reload slash commands",
  role: "admin",
  usage: "[command names]",
  args: true,
  execute,
};
