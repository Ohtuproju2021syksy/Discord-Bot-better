const { updateDynamicChoices } = require("../services/command");

const execute = async (event, client, Course) => {
  await updateDynamicChoices(client, ["join", "leave"], Course);
};

module.exports = {
  name: "COURSES_CHANGED",
  execute,
};