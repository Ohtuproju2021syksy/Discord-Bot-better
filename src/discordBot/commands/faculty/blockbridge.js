const { SlashCommandBuilder } = require("@discordjs/builders");
const { findChannelFromDbByName } = require("../../services/service");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Blocking the bridge to Telegram...");

  const channel = client.guild.channels.cache.get(interaction.channelId);
  const channelInstance = await findChannelFromDbByName(channel.name, models.Channel);

  if (!channelInstance) {
    return await editErrorEphemeral(interaction, "command can only be performed on course channels!");
  }

  if (!channelInstance.bridged) {
    return await editErrorEphemeral(interaction, "The bridge is already blocked.");
  }

  channelInstance.bridged = false;
  await channelInstance.save();
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
