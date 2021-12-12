const { SlashCommandBuilder } = require("@discordjs/builders");
const { checkCourseCooldown, handleCooldown, getCourseNameFromCategory, msToMinutesAndSeconds } = require("../../services/service");
const { findChannelFromDbByDiscordId, editChannelName, findChannelFromDbByName } = require("../../../db/services/channelService");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");
const { confirmChoice } = require("../../services/confirm");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Renaming text channel...");

  const courseModel = models.Course;
  const channelModel = models.Channel;
  const newName = interaction.options.getString("name").trim().replace(/ /g, "-").toLowerCase();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return await editErrorEphemeral(interaction, "Course not found, can not rename the channel.");
  }

  const parentChannel = await findCourseFromDb(getCourseNameFromCategory(channel.parent.name), courseModel);

  if (!parentChannel) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not rename the channel.");
  }

  const channelName = `${parentChannel.name.replace(/ /g, "-")}_${newName}`;

  if (await findChannelFromDbByName(channelName, channelModel)) {
    return await editErrorEphemeral(interaction, "Channel with given name already exists");
  }

  const currentChannel = await findChannelFromDbByDiscordId(interaction.channelId, channelModel);

  if (!currentChannel) {
    return await editErrorEphemeral(interaction, "Channel not found from database.");
  }

  const confirm = await confirmChoice(interaction, "Confirm command: Rename channel to " + channelName);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const cooldown = checkCourseCooldown(currentChannel.name);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }

  await editChannelName(currentChannel.discordId, channelName, channelModel);
  await editEphemeral(interaction, `Edited channel name to ${channelName}`);
  handleCooldown(channelName);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rename_channel")
    .setDescription("Rename text channel the command was used in.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("name")
        .setDescription("New name for the channel")
        .setRequired(true)),
  execute,
  usage: "/rename_channel [new name]",
  description: "Rename text channel the command was used in.*",
  roles: ["admin", facultyRole],
};
