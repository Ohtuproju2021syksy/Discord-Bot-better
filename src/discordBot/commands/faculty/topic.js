const {
  handleCooldown,
  msToMinutesAndSeconds,
  trimCourseName } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const used = new Map();

/**
 *
 * @param {Object} channelObject
 * @param {Discord.GuildChannel} parent
 */


const execute = async (interaction, client) => {
  const newTopic = interaction.data.options[0].value.trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  if (!channel?.parent?.name?.startsWith("🔒") && !channel?.parent?.name?.startsWith("📚")) {
    return sendEphemeral(client, interaction, "This is not a course category, can not execute the command");
  }

  const categoryName = trimCourseName(channel.parent, guild);
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_announcement"));
  const channelGeneral = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_general"));

  const cooldown = used.get(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return sendEphemeral(client, interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }

  await channelAnnouncement.setTopic(newTopic);
  await channelGeneral.setTopic(newTopic);

  const cooldownTimeMs = 1000 * 60 * 15;
  used.set(categoryName, Date.now() + cooldownTimeMs);
  handleCooldown(used, categoryName, cooldownTimeMs);

  return sendEphemeral(client, interaction, "Channel topic has been changed");
};

module.exports = {
  name: "topic",
  description: "Add or update course announcement and general channel topics.",
  usage: "[new topic]",
  args: true,
  joinArgs: true,
  guide: true,
  role: facultyRole,
  options: [
    {
      name: "topic",
      description: "Topic text",
      type: 3,
      required: true,
    },
  ],
  execute,
};
