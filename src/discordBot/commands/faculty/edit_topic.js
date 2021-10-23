const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  handleCooldown,
  checkCourseCooldown,
  msToMinutesAndSeconds,
  trimCourseName } = require("../../services/service");
const { editErrorEphemeral, sendEphemeral, editEphemeral, confirmChoice } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  await sendEphemeral(interaction, "Editing topic...");
  const newTopic = interaction.options.getString("topic").trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel?.parent?.name?.startsWith("🔐") && !channel?.parent?.name?.startsWith("📚") && !channel?.parent?.name?.startsWith("👻")) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const categoryName = trimCourseName(channel.parent, guild);
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_announcement"));
  const channelGeneral = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_general"));

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

  await channelAnnouncement.setTopic(newTopic);
  await channelGeneral.setTopic(newTopic);

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
