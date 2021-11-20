const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  findCategoryWithCourseName } = require("../../services/service");
const { setCourseToPublic, updateGuide, findCourseFromDb } = require("../../../db/services/courseService");
const { editEphemeral, editErrorEphemeral, sendEphemeral, confirmChoice } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Unhiding course...");
  const courseName = interaction.options.getString("course").trim();
  const guild = client.guild;

  const confirm = await confirmChoice(interaction, "Unhide course: " + courseName);
  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const categoryInstance = await findCourseFromDb(courseName, models.Course);
  if (!categoryInstance || !categoryInstance.private) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is public already!`);
  }

  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await editEphemeral(interaction, `This course ${courseName} is now public.`);
    await setCourseToPublic(courseName, models.Course);
    await client.emit("COURSES_CHANGED", models.Course);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unhide_course")
    .setDescription("Unhide course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Unhide given course")
        .setRequired(true)),
  execute,
  usage: "/unhide_course [course name]",
  description: "Unhide course.",
  roles: ["admin", facultyRole],
};
