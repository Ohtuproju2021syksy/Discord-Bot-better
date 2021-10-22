const { SlashCommandBuilder } = require("@discordjs/builders");
const { findChannelFromDbByName, findCourseFromDb, getCourseNameFromCategory, isCourseCategory } = require("../../services/service");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Disabling the bridge to Telegram...");

  const channel = client.guild.channels.cache.get(interaction.channelId);
  if (!isCourseCategory(channel?.parent)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const channelInstance = await findChannelFromDbByName(channel.name, models.Channel);

  if (!channelInstance) {
    return await editErrorEphemeral(interaction, "Command can't be performed on default course channels!");
  }

  if (!channelInstance.bridged) {
    return await editErrorEphemeral(interaction, "The bridge is already disabled on this channel.");
  }

  channelInstance.bridged = false;
  await channelInstance.save();

  const courseInstance = await findCourseFromDb(getCourseNameFromCategory(channel.parent.name), models.Course);
  const response = courseInstance.telegramId ? "The bridge between this channel and Telegram is now disabled." : "The bridge on this channel is now disabled and messages won't be sent to Telegram if this course is bridged in the future.";
  await editEphemeral(interaction, response);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disable_bridge")
    .setDescription("Disables the bridge between this channel and Telegram.")
    .setDefaultPermission(false),
  execute,
  usage: "/disable_bridge",
  description: "Disables the bridge between this channel and Telegram.",
  roles: ["admin", facultyRole],
};
