const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  updateGuide,
  createLockedCategoryName,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  setCourseToUnlocked } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");
const { unlockTelegramCourse } = require("../../../bridge/service");
const execute = async (interaction, client, Course) => {
  await sendEphemeral(interaction, "Unlocking course...");
  const courseName = interaction.options.getString("course").trim();
  const guild = client.guild;
  const courseString = createLockedCategoryName(courseName);
  const category = findChannelWithNameAndType(courseString, "GUILD_CATEGORY", guild);
  if (!category) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is public already!`);
  }
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await category.setName(`📚 ${courseName}`);
    await unlockTelegramCourse(Course, courseName);
    await setCourseToUnlocked(courseName, Course, guild);
    await client.emit("COURSES_CHANGED", Course);
    await updateGuide(client.guild, Course);
    await editEphemeral(interaction, `This course ${courseName} is now public.`);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Unlock given course")
        .setRequired(true)),
  execute,
  usage: "/unlock [course name]",
  description: "Unlock course.",
  roles: ["admin", facultyRole],
};
