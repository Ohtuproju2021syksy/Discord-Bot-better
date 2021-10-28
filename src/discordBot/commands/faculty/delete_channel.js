const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory, removeChannelFromDb, isCourseCategory } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral, confirmChoice } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Deleting text channel...");
  const channelModel = models.Channel;
  const deleteName = interaction.options.getString("channel").toLowerCase().trim().replace(/ /g, "-");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!isCourseCategory(channel?.parent)) {
    return await editErrorEphemeral(interaction, "This command can be used only in course channels");
  }

  const categoryName = getCourseNameFromCategory(channel.parent.name).replace(/ /g, "-");
  const deleteChannelName = `${categoryName}_${deleteName}`.toLowerCase();

  if (deleteName === "general" || deleteName === "announcement" || deleteName === "voice") {
    return await editErrorEphemeral(interaction, "Original channels can not be deleted.");
  }

  const confirm = await confirmChoice(interaction, "Confirm command: Delete channel " + deleteChannelName);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
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
