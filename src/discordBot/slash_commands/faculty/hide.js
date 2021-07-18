const { updateGuide, createCategoryName } = require("../../services/service");
const { sendEphemeral } = require("../utils");

const used = new Map();

const msToMinutesAndSeconds = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds}`;
};

const execute = async (interaction, client) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();
  const guild = client.guild;
  const courseString = createCategoryName(courseName);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
  if (!category) {
    return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is private already.`);
  }
  const cooldown = used.get(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return sendEphemeral(client, interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }
  else {
    await category.setName(`🔒 ${courseName}`);
    sendEphemeral(client, interaction, `This course ${courseName} is now private.`);
    const cooldownTimeMs = 1000 * 60 * 10;
    used.set(courseName, Date.now() + cooldownTimeMs);
    setTimeout(() => { used.delete(courseName);}, cooldownTimeMs);
    await client.emit("COURSES_CHANGED");
    await updateGuide(client.guild);
  }
};

module.exports = {
  name: "hide",
  description: "Hide given course",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  options: [
    {
      name: "course",
      description: "Hide given course",
      type: 3,
      required: true,
    },
  ],
  execute,
};
