const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  handleCooldown,
  checkCourseCooldown,
  msToMinutesAndSeconds,
  getCourseNameFromCategory,
  isCourseCategory } = require("../../services/service");
const { editErrorEphemeral, sendEphemeral, editEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { facultyRole } = require("../../../../config.json");
const { saveChannelTopicToDb } = require("../../../db/services/channelService");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Editing topic...");
  const newTopic = interaction.options.getString("topic").trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!await isCourseCategory(channel?.parent, models.Course)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const categoryName = getCourseNameFromCategory(channel.parent, guild);

  const confirm = await confirmChoice(interaction, "Change topic to: " + newTopic);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const cooldown = checkCourseCooldown(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }

  await channel.setTopic(newTopic);
  await saveChannelTopicToDb(getCourseNameFromCategory(channel.name), newTopic, models.Channel);

  await editEphemeral(interaction, "Channel topic has been changed");
  handleCooldown(categoryName);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit_topic")
    .setDescription("Add or update course channel topics.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("Topic text")
        .setRequired(true)),
  execute,
  usage: "/edit_topic [new topic]",
  description: "Add or update course channel topics.*",
  roles: ["admin", facultyRole],
};
