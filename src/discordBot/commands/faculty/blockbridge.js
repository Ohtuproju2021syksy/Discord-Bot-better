const { SlashCommandBuilder } = require("@discordjs/builders");
const { findChannelFromDb } = require("../../services/service");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Blocking the bridge to Telegram...");

  const channel = findChannelFromDb(interaction.channelId, models.Channel);

  if (!channel) {
    return await editErrorEphemeral(interaction, "Error: command can only be performed on course channels!");
  }

  if (!channel.bridged) {
    return await editErrorEphemeral(interaction, "The bridge is already blocked.");
  }

  channel.bridged = false;
  await channel.save();
  await editEphemeral(interaction, "The bridge between this channel and Telegram is now blocked.");
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blockbridge")
    .setDescription("Blocks the bridge between this channel and Telegram.")
    .setDefaultPermission(false),
  execute,
  usage: "/blockbridge",
  description: "Blocks the bridge between this channel and Telegram.",
  roles: ["admin", facultyRole],
};
