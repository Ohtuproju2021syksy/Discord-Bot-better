const { updateGuide, findCategoryName, removeGroup } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { Groups } = require("../../../db/dbInit");

const execute = async (interaction, client) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const courseString = findCategoryName(courseName, guild);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);

  const channelGeneral = guild.channels.cache.find(c => c.parent === category && c.name.includes("general"));

  if (!category) return sendEphemeral(client, interaction, `Invalid course name: ${courseName}.`);
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === category)
    .map(async channel => await channel.delete()),
  );

  await category.delete();

  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} admin` || r.name === courseName))
    .map(async role => await role.delete()),
  );
  sendEphemeral(client, interaction, `Deleted course ${courseName}.`);
  await client.emit("COURSES_CHANGED");
  await updateGuide(client.guild);

  // Telegram db link remove
  if (channelGeneral) {
    const channelName = channelGeneral.name.split("_")[0];
    removeGroup(channelName, Groups);
  }
};

module.exports = {
  name: "remove",
  description: "Delete course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  options: [
    {
      name: "course",
      description: "Course to delete.",
      type: 3,
      required: true,
    },
  ],
  execute,
};
