const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  updateGuide,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  setCourseToLocked,
  getHiddenCourse,
  getUnlockedCourse } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");
const { lockTelegramCourse } = require("../../../bridge/service");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Locking course...");
  const courseName = interaction.options.getString("course").trim();
  const guild = client.guild;
  const category = getUnlockedCourse(courseName, guild);
  if (!category) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is locked already!`);
  }
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    if (getHiddenCourse(courseName, guild)) {
      await category.setName(`👻🔐 ${courseName}`);
    }
    else {
      await category.setName(`📚🔐 ${courseName}`);
    }
    await setCourseToLocked(courseName, models.Course, guild);
    await lockTelegramCourse(models.Course, courseName);
    await client.emit("COURSES_CHANGED", models.Course);
    await updateGuide(client.guild, models.Course);
    await editEphemeral(interaction, `This course ${courseName} is now locked.`);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock given course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Lock given course")
        .setRequired(true)),
  execute,
  usage: "/lock [course name]",
  description: "Lock given course.",
  roles: ["admin", facultyRole],
};
