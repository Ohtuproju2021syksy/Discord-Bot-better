const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown } = require("../../services/service");
const { setCourseToPrivate, findCourseFromDb } = require("../../../db/services/courseService");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Hiding course...");
  const courseName = interaction.options.getString("course").trim();

  const confirm = await confirmChoice(interaction, "Hide course: " + courseName);
  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const categoryInstance = await findCourseFromDb(courseName, models.Course);
  if (!categoryInstance || categoryInstance.private) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is private already!`);
  }

  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await setCourseToPrivate(courseName, models.Course);
    await editEphemeral(interaction, `This course ${courseName} is now private.`);
    await client.emit("COURSES_CHANGED", models.Course);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hide_course")
    .setDescription("Hide given course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Hide given course")
        .setRequired(true)),
  execute,
  usage: "/hide_course [course name]",
  description: "Hide given course.",
  roles: ["admin", facultyRole],
};
