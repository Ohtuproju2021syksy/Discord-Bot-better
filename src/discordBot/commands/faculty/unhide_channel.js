const { SlashCommandBuilder } = require("@discordjs/builders");
const { getChannelByDiscordId, editChannelHiddenStatus } = require("../../../db/services/channelService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");
const { confirmChoice } = require("../../services/confirm");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Unhiding text channel...");

  const channelModel = models.Channel;

  const channel = await getChannelByDiscordId(interaction.channelId, channelModel);

  if (!channel || !channel.courseId) {
    return await editErrorEphemeral(interaction, "Course not found, can not unhide the channel.");
  }

  const confirm = await confirmChoice(interaction, "Confirm command: Unhide channel");

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  if (channel.defaultChannel) {
    return await editErrorEphemeral(interaction, "Command can't be performed on default course channels!");
  }

  if (!channel.hidden) {
    return await editErrorEphemeral(interaction, "The channel is already unhidden.");
  }

  await editChannelHiddenStatus(channel.discordId, false, channelModel);
  await editEphemeral(interaction, `Unhid channel ${channel.name}`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unhide_channel")
    .setDescription("Unhide text channel the command was used in from regular users.")
    .setDefaultPermission(false),
  execute,
  usage: "/unhide_channel",
  description: "Unhide text channel the command was used in from regular users.*",
  roles: ["admin", facultyRole],
};
