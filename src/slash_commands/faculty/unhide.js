const { updateGuide, createPrivateCategoryName } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const execute = async (interaction) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const courseString = createPrivateCategoryName(courseName);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
  if (category) {
    await guild.channels.cache.get(category.id).setName(`📚 ${courseName}`);
  }
  else {
    return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is public already.`);
  }

  sendEphemeral(client, interaction, `This course ${courseName} is now public.`);

  client.emit("COURSES_CHANGED");
  updateGuide(client.guild);
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
