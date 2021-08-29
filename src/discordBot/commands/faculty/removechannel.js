const { SlashCommandBuilder } = require("@discordjs/builders");

const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  const deleteName = interaction.options.getString("input").value.toLowerCase().trim().replace(/ /g, "-");

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

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
  data: new SlashCommandBuilder()
    .setName("removechannel")
    .setDescription("Remove given text channel from course.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("channel")
        .setDescription("Remove given text channel")
        .setRequired(true)),
  execute,
  usage: "/removechannel [channel name]",
  description: "Remove given text channel from course.*",
  roles: ["admin", facultyRole],
};