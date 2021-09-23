const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  updateGuide,
  createCategoryName,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  setCourseToPrivate } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const courseName = interaction.options.getString("course").toLowerCase().trim();
  const guild = client.guild;
  const courseString = createCategoryName(courseName);
  const category = findChannelWithNameAndType(courseString, "GUILD_CATEGORY", guild);
  if (!category) {
    return await sendErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is private already!`);
  }
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await sendErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await category.setName(`🔒 ${courseName}`);
    await setCourseToPrivate(courseName, Course);
    await sendEphemeral(interaction, `This course ${courseName} is now private.`);
    await client.emit("COURSES_CHANGED", Course);
    await updateGuide(client.guild, Course);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hide")
    .setDescription("Hide given course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Hide given course")
        .setRequired(true)),
  execute,
  usage: "/hide [course name]",
  description: "Hide given course.",
  roles: ["admin", facultyRole],
};
