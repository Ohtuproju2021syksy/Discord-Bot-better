const { SlashCommandBuilder } = require("@discordjs/builders");
const { getRoleFromCategory, findOrCreateChannel, findChannelWithNameAndType } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
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
  const channelName = interaction.options.getString("channel").trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return await sendErrorEphemeral(interaction, "Course not found, can not create new channel.");
  }

  if (!channel.parent.name.startsWith("🔒") && !channel.parent.name.startsWith("📚")) {
    return await sendErrorEphemeral(interaction, "This is not a course category, can not create new channel.");
  }

  if (guild.channels.cache.filter(c => c.parent === channel.parent).size >= 13) {
    return await sendErrorEphemeral(interaction, "Maximum added text channel amount is 10");
  }
  const categoryName = channel.parent.name;
  const courseName = getRoleFromCategory(categoryName);
  if (findChannelWithNameAndType(`${courseName}_${channelName}`, "GUILD_TEXT", guild)) {
    return await sendErrorEphemeral(interaction, "Channel with given name already exists");
  }

  const category = channel.parent;
  const student = await guild.roles.cache.find((role) => role.name === courseName);
  const admin = await guild.roles.cache.find((role) => role.name === `${courseName} ${courseAdminRole}`);

  const channelObjects = getChannelObjects(guild, admin, student, courseName, channelName, category);
  await Promise.all(channelObjects.map(
    async channelObject => await findOrCreateChannel(channelObject, guild),
  ));
  await sendEphemeral(interaction, `Created new channel ${courseName}_${channelName}`);

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