const { SlashCommandBuilder } = require("@discordjs/builders");

const { getRoleFromCategory, findOrCreateChannel } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const getChannelObjects = (guild, admin, student, roleName, channelName, category) => {
  roleName = roleName.replace(/ /g, "-");
  return [
    {
      name: `${roleName}_${channelName}`,
      parent: category,
      options: { type: "GUILD_TEXT", parent: category, permissionOverwrites: [] },
    },
  ];
};

const execute = async (interaction, client) => {

  const channelName = interaction.options.getString("input").value.toLowerCase().trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return sendEphemeral(client, interaction, "Course not found, can not create new channel.");
  }

  if (!channel.parent.name.startsWith("🔒") && !channel.parent.name.startsWith("📚")) {
    return sendEphemeral(client, interaction, "This is not a course category, can not create new channel.");
  }

  if (guild.channels.cache.filter(c => c.parent === channel.parent).size >= 13) {
    return sendEphemeral(client, interaction, "Maximum added text channel amount is 10");
  }
  else {
    const categoryName = channel.parent.name;
    const category = channel.parent;

    const courseName = getRoleFromCategory(categoryName);

    // Roles
    const student = await guild.roles.cache.find((role) => role.name === courseName);
    const admin = await guild.roles.cache.find((role) => role.name === `${courseName} ${courseAdminRole}`);

    // Channels
    const channelObjects = getChannelObjects(guild, admin, student, courseName, channelName, category);
    await Promise.all(channelObjects.map(
      async channelObject => await findOrCreateChannel(channelObject, guild),
    ));
    sendEphemeral(client, interaction, `Created new channel ${courseName}_${channelName}`);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("newchannel")
    .setDescription("Create new text channel to course.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("channel")
        .setDescription("Create new text channel")
        .setRequired(true)),
  execute,
  usage: "/newchannel [channel name]",
  description: "Create new text channel to course.*",
  roles: ["admin", facultyRole],
};