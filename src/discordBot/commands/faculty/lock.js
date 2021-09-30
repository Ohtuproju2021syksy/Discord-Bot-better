const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  updateGuide,
  createCategoryName,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  setCourseToLocked } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const courseName = interaction.options.getString("course").trim();
  const guild = client.guild;
  const courseString = createCategoryName(courseName);
  const category = findChannelWithNameAndType(courseString, "GUILD_CATEGORY", guild);
  if (!category) {
    return await sendErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is locked already!`);
  }
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await sendErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await category.setName(`🔐 ${courseName}`);
    await setCourseToLocked(courseName, Course, guild);
    await sendEphemeral(interaction, `This course ${courseName} is now locked.`);
    await client.emit("COURSES_CHANGED", Course);
    await updateGuide(client.guild, Course);
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
