const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  const deleteName = interaction.data.options[0].value.toLowerCase().trim().replace(/ /g, "-");

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  if (!channel.parent) {
    return sendEphemeral(client, interaction, "This command can be used only in course channels");
  }

  if (!channel.parent.name.startsWith("🔒") && !channel.parent.name.startsWith("📚")) {
    return sendEphemeral(client, interaction, "This command can be used only in course channels");
  }

  const categoryName = getRoleFromCategory(channel.parent.name).replace(/ /g, "-");

  const deleteCourseName = `${categoryName}_${deleteName}`;

  if (deleteName === "general" || deleteName === "announcement" || deleteName === "voice") {
    return sendEphemeral(client, interaction, "Original channels can not be removed.");
  }

  const guildName = guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteCourseName);
  if (!guildName) {
    return sendEphemeral(client, interaction, "There is not added channel with given name.");
  }

  guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteCourseName).delete();
  return sendEphemeral(client, interaction, `${deleteName} removed!`);
};

module.exports = {
  name: "removechannel",
  description: "Remove given text channel from course.",
  usage: "[channel name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: facultyRole,
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