const { SlashCommandBuilder } = require("@discordjs/builders");
const { findChannelFromDbByName } = require("../../services/service");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Opening the bridge to Telegram...");

  const channel = client.guild.channels.cache.get(interaction.channelId);
  const channelInstance = await findChannelFromDbByName(channel.name, models.Channel);

  if (!channelInstance) {
    return await editErrorEphemeral(interaction, "command can only be performed on course channels!");
  }

  if (channelInstance.bridged) {
    return await editErrorEphemeral(interaction, "This channel is already bridged.");
  }

  channelInstance.bridged = true;
  await channelInstance.save();
  await editEphemeral(interaction, "Messages from this channel will now on be sent to the bridged Telegram.");
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unblockbridge")
    .setDescription("Unblocks the bridge between this channel and Telegram.")
    .setDefaultPermission(false),
  execute,
  usage: "/unblockbridge",
  description: "unblocks the bridge between this channel and Telegram.",
  roles: ["admin", facultyRole],
};
