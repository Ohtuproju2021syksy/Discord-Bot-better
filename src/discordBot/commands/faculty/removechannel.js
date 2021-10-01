const { SlashCommandBuilder } = require("@discordjs/builders");
const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  await sendEphemeral(interaction, "Removing text channel...");
  const deleteName = interaction.options.getString("channel").toLowerCase().trim().replace(/ /g, "-");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return await editErrorEphemeral(interaction, "This command can be used only in course channels");
  }

  if (!channel.parent.name.startsWith("🔒") && !channel.parent.name.startsWith("📚")) {
    return await editErrorEphemeral(interaction, "This command can be used only in course channels");
  }

  const categoryName = getRoleFromCategory(channel.parent.name).replace(/ /g, "-");
  const deleteCourseName = `${categoryName}_${deleteName}`;

  if (deleteName === "general" || deleteName === "announcement" || deleteName === "voice") {
    return await editErrorEphemeral(interaction, "Original channels can not be removed.");
  }

  const guildName = guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteCourseName);
  if (!guildName) {
    return await editErrorEphemeral(interaction, "There is no added channel with given name.");
  }

  guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteCourseName).delete();
  return await editEphemeral(interaction, `${deleteName} removed!`);
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