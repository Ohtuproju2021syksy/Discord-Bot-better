const { updateDynamicChoices } = require("../services/command");

const execute = async (event, client, models) => {
  await updateDynamicChoices(client, ["join", "leave"], models.Course);
};

module.exports = {
  name: "COURSES_CHANGED",
  execute,
};