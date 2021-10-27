const { SlashCommandBuilder } = require("@discordjs/builders");
const { getRoleFromCategory } = require("../../services/service");
const { removeChannelFromDb } = require("../../../db/services/channelService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Deleting text channel...");
  const channelModel = models.Channel;
  const deleteName = interaction.options.getString("channel").toLowerCase().trim().replace(/ /g, "-");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel?.parent?.name?.startsWith("🔐") && !channel?.parent?.name?.startsWith("📚") && !channel?.parent?.name?.startsWith("👻")) {
    return await editErrorEphemeral(interaction, "This command can be used only in course channels");
  }

  const categoryName = getRoleFromCategory(channel.parent.name).replace(/ /g, "-");
  const deleteChannelName = `${categoryName}_${deleteName}`;

  if (deleteName === "general" || deleteName === "announcement" || deleteName === "voice") {
    return await editErrorEphemeral(interaction, "Original channels can not be deleted.");
  }

  const guildName = guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteChannelName);
  if (!guildName) {
    return await editErrorEphemeral(interaction, "There is no added channel with given name.");
  }

  guild.channels.cache.find(c => c.parent === channel.parent && c.name === deleteChannelName).delete();
  await removeChannelFromDb(deleteChannelName, channelModel);
  return await editEphemeral(interaction, `${deleteName} deleted!`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete_channel")
    .setDescription("Delete given text channel from course.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("channel")
        .setDescription("Delete given text channel")
        .setRequired(true)),
  execute,
  usage: "/delete_channel [channel name]",
  description: "Delete given text channel from course.*",
  roles: ["admin", facultyRole],
};
