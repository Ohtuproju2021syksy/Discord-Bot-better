const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory } = require("../../services/service");
const { removeChannelFromDb, findChannelFromDbByName } = require("../../../db/services/channelService");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Deleting text channel...");
  const channelModel = models.Channel;
  const courseModel = models.Course;
  const deleteName = interaction.options.getString("channel").toLowerCase().trim().replace(/ /g, "-");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return await editErrorEphemeral(interaction, "Course not found, can not delete channel.");
  }

  const parentChannel = await findCourseFromDb(getCourseNameFromCategory(channel.parent.name), courseModel);

  if (!parentChannel) {
    return await editErrorEphemeral(interaction, "This command can be used only in course channels");
  }

  const deleteChannelName = `${parentChannel.name}_${deleteName}`.toLowerCase();

  if (deleteName === "general" || deleteName === "announcement" || deleteName === "voice") {
    return await editErrorEphemeral(interaction, "Original channels can not be deleted.");
  }

  const confirm = await confirmChoice(interaction, "Confirm command: Delete channel " + deleteChannelName);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const channelFromDb = await findChannelFromDbByName(deleteChannelName, channelModel);
  if (!channelFromDb) {
    return await editErrorEphemeral(interaction, "There is no added channel with given name.");
  }

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
