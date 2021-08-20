const {
  updateGuide,
  createPrivateCategoryName,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  handleCooldown,
  setCourseToPublic } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const used = new Map();

const execute = async (interaction, client, Course) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();
  const guild = client.guild;
  const courseString = createPrivateCategoryName(courseName);
  const category = findChannelWithNameAndType(courseString, "category", guild);
  if (!category) {
    return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is public already.`);
  }
  const cooldown = used.get(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return sendEphemeral(client, interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }
  else {
    await category.setName(`📚 ${courseName}`);
    sendEphemeral(client, interaction, `This course ${courseName} is now public.`);
    await setCourseToPublic(courseName, Course);
    const cooldownTimeMs = 1000 * 60 * 15;
    used.set(courseName, Date.now() + cooldownTimeMs);
    handleCooldown(used, courseName, cooldownTimeMs);
    await client.emit("COURSES_CHANGED", Course);
    await updateGuide(client.guild, Course);
  }
};

module.exports = {
  name: "unhide",
  description: "Unhide given course",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: facultyRole,
  options: [
    {
      name: "course",
      description: "Unhide given course",
      type: 3,
      required: true,
    },
  ],
  execute,
};
