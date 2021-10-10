const { SlashCommandBuilder } = require("@discordjs/builders");
const { findChannelFromDbByName, findCourseFromDb, trimCourseName } = require("../../services/service");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Opening the bridge to Telegram...");

  const channel = client.guild.channels.cache.get(interaction.channelId);
  if (!channel?.parent?.name?.startsWith("🔒") && !channel?.parent?.name?.startsWith("📚")) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const channelInstance = await findChannelFromDbByName(channel.name, models.Channel);

  if (!channelInstance) {
    return await editErrorEphemeral(interaction, "command can't be performed on default course channels!");
  }

  if (channelInstance.bridged) {
    return await editErrorEphemeral(interaction, "This channel is already unblocked.");
  }

  channelInstance.bridged = true;
  await channelInstance.save();
  const courseInstance = await findCourseFromDb(trimCourseName(channel.parent.name), models.Course);
  const response = courseInstance.telegramId ? "Messages from this channel will now on be sent to the bridged Telegram." : "This channel is now unblocked and messages will be sent to Telegram if this course is bridged in the future.";
  await editEphemeral(interaction, response);
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
