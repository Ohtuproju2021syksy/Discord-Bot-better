const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {
  const deleteName = interaction.data.options[0].value.toLowerCase().trim().replace(/ /g, "-");

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  let categoryName = getRoleFromCategory(channel.parent.name);
  if (categoryName.includes(" ")) {
    categoryName = categoryName.replace(/ /g, "-");
  }

  const deleteCourseName = `${categoryName}_${deleteName}`;

  if (deleteName === "general" || deleteName === "announcement" || deleteName === "voice") {
    return sendEphemeral(client, interaction, "Original channels can not be removed.");
  }

  if (!channel.parent) {
    return sendEphemeral(client, interaction, "Course not found, can not remove given channel.");
  }

  if (!channel.parent.name.startsWith("🔒") && !channel.parent.name.startsWith("📚")) {
    return sendEphemeral(client, interaction, "This is not a course category, can not remove given channel.");
  }

  const guildName = guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteCourseName);
  if (!guildName) {
    return sendEphemeral(client, interaction, "There is not added channel with given name.");
  }

  guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteCourseName).delete();
  return sendEphemeral(client, interaction, "Given channel is removed.");
};

module.exports = {
  name: "removechannel",
  description: "Remove given text channel from course.",
  usage: "[channel name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  options: [
    {
      name: "channel",
      description: "Remove given text channel",
      type: 3,
      required: true,
    },
  ],
  execute,
};