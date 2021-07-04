const { reloadCommands } = require("../slash_commands/utils");

const execute = async (client) => {
  await reloadCommands(client, ["join", "leave"]);
};

module.exports = {
  name: "COURSES_CHANGED",
  execute,
};