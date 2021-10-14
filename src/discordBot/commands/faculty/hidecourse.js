const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  updateGuide,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  setCourseToPrivate,
  getPublicCourse,
  getLockedCourse } = require("../../services/service");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Hiding course...");
  const courseName = interaction.options.getString("course").trim();
  const guild = client.guild;
  const category = getPublicCourse(courseName, guild);
  if (!category) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${courseName} or the course is private already!`);
  }
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }
  else {
    if (getLockedCourse(courseName, guild)) {
      await category.setName(`👻🔐 ${courseName}`);
    }
    else {
      await category.setName(`👻 ${courseName}`);
    }
    await setCourseToPrivate(courseName, models.Course);
    await editEphemeral(interaction, `This course ${courseName} is now private.`);
    await client.emit("COURSES_CHANGED", models.Course);
    await updateGuide(client.guild, models.Course);
    handleCooldown(courseName);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hidecourse")
    .setDescription("Hide given course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Hide given course")
        .setRequired(true)),
  execute,
  usage: "/hidecourse [course name]",
  description: "Hide given course.",
  roles: ["admin", facultyRole],
};
