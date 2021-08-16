const { reloadCommands } = require("../commands/utils");

const execute = async (client, Course) => {
  await reloadCommands(client, ["join", "leave"], Course);
};

module.exports = {
  name: "COURSES_CHANGED",
  execute,
};