const { updateGuide, createPrivateCategoryName } = require("../../services/service");
const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const courseString = createPrivateCategoryName(courseName);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
  if (category) {
    await category.setName(`📚 ${courseName}`)
      .catch(console.error);
  }
  else {
    return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is public already.`);
  }

  sendEphemeral(client, interaction, `This course ${courseName} is now public.`);

  await client.emit("COURSES_CHANGED");
  await updateGuide(client.guild);
};

module.exports = {
  name: "unhide",
  description: "Unhide given course",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
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
