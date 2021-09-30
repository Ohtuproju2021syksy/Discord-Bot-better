const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  handleCooldown,
  checkCourseCooldown,
  msToMinutesAndSeconds,
  trimCourseName } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  const newTopic = interaction.options.getString("topic").trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel?.parent?.name?.startsWith("🔒") && !channel?.parent?.name?.startsWith("📚")) {
    return await sendErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const categoryName = trimCourseName(channel.parent, guild);
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_announcement"));
  const channelGeneral = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_general"));

  const cooldown = checkCourseCooldown(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await sendErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}!`);
  }

  await channelAnnouncement.setTopic(newTopic);
  await channelGeneral.setTopic(newTopic);

  await sendEphemeral(interaction, "Channel topic has been changed");
  handleCooldown(categoryName);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topic")
    .setDescription("Add or update course channel topics.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("Topic text")
        .setRequired(true)),
  execute,
  usage: "/topic [new topic]",
  description: "Add or update course channel topics.*",
  roles: ["admin", facultyRole],
};
