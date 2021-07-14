const { updateGuide, createCategoryName } = require("../../services/service");
const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const courseString = createCategoryName(courseName);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
  if (category) {
    await category.setName(`🔒 ${courseName}`)
      .catch(console.error);
  }
  else {
    return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is private already.`);
  }

  sendEphemeral(client, interaction, `This course ${courseName} is now private.`);

  await client.emit("COURSES_CHANGED");
  await updateGuide(client.guild);
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
