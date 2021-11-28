const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown } = require("../../services/service");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { setCourseToLocked } = require("../../../db/services/courseService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Locking course...");
  const courseName = interaction.options.getString("course").trim();
  const guild = client.guild;

  const confirm = await confirmChoice(interaction, "Lock course: " + courseName);
  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const categoryInstance = await findCourseFromDb(courseName, models.Course);
  if (!categoryInstance || categoryInstance.locked) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is locked already!`);
  }
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await setCourseToLocked(courseName, models.Course, guild);
    await client.emit("COURSES_CHANGED", models.Course);
    await editEphemeral(interaction, `This course ${courseName} is now locked.`);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock_chat")
    .setDescription("Lock chat in given course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Lock chat in given course")
        .setRequired(true)),
  execute,
  usage: "/lock_chat [course name]",
  description: "Lock given course.",
  roles: ["admin", facultyRole],
};
