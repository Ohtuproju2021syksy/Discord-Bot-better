const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory, isCourseCategory } = require("../../services/service");
const { findChannelFromDbByName } = require("../../../db/services/channelService");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Disabling the bridge to Telegram...");

  const channel = client.guild.channels.cache.get(interaction.channelId);
  if (!await isCourseCategory(channel?.parent, models.Course)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const confirm = await confirmChoice(interaction, "Disable bridge of: " + channel.name);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const channelInstance = await findChannelFromDbByName(channel.name, models.Channel);
  if (channelInstance.defaultChannel) {
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
