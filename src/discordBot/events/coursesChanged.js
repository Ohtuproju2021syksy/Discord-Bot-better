const { updateDynamicChoices } = require("../services/command");

const execute = async (event, client, models) => {
  await updateDynamicChoices(client, ["join", "leave", "hide_course", "unhide_course", "lock_chat", "unlock_chat"], models.Course);
};

module.exports = {
  name: "COURSES_CHANGED",
  execute,
};