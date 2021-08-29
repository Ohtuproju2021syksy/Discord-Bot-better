const { SlashCommandBuilder } = require("@discordjs/builders");

const {
  updateGuide,
  createCategoryName,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  handleCooldown,
  setCourseToPrivate } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const used = new Map();

const execute = async (interaction, client, Course) => {
  const courseName = interaction.options.getString("course").toLowerCase().trim();
  const guild = client.guild;
  const courseString = createCategoryName(courseName);
  const category = findChannelWithNameAndType(courseString, "GUILD_CATEGORY", guild);
  if (!category) {
    return await sendErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is private already!`);
  }
  const cooldown = used.get(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await sendErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    await category.setName(`🔒 ${courseName}`);
    await setCourseToPrivate(courseName, Course);
    await sendEphemeral(`This course ${courseName} is now private.`);
    const cooldownTimeMs = 1000 * 60 * 15;
    used.set(courseName, Date.now() + cooldownTimeMs);
    handleCooldown(used, courseName, cooldownTimeMs);
    await client.emit("COURSES_CHANGED", Course);
    await updateGuide(client.guild, Course);
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
