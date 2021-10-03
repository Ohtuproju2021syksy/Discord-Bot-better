const { SlashCommandBuilder } = require("@discordjs/builders");
const { getRoleFromCategory, findOrCreateChannel, findChannelWithNameAndType, createChannelToDb } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
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

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Creating text channel...");
  const channelName = interaction.options.getString("channel").trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return await editErrorEphemeral(interaction, "Course not found, can not create new channel.");
  }

  if (!channel.parent.name.startsWith("🔒") && !channel.parent.name.startsWith("📚")) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not create new channel.");
  }

  if (guild.channels.cache.filter(c => c.parent === channel.parent).size >= 13) {
    return await editErrorEphemeral(interaction, "Maximum added text channel amount is 10");
  }
  const categoryName = channel.parent.name;
  const courseName = getRoleFromCategory(categoryName);
  if (findChannelWithNameAndType(`${courseName}_${channelName}`, "GUILD_TEXT", guild)) {
    return await editErrorEphemeral(interaction, "Channel with given name already exists");
  }

  const category = channel.parent;
  const student = await guild.roles.cache.find((role) => role.name === courseName);
  const admin = await guild.roles.cache.find((role) => role.name === `${courseName} ${courseAdminRole}`);

  const channelObjects = getChannelObjects(guild, admin, student, courseName, channelName, category);
  await Promise.all(channelObjects.map(
    async channelObject => await findOrCreateChannel(channelObject, guild),
  ));

  const newChannel = findChannelWithNameAndType(`${courseName}_${channelName}`, "GUILD_TEXT", guild);
  const topic = channel.topic ? channel.topic : null;
  await createChannelToDb(newChannel.id, channel.parentId, channelName, topic, models.Channel);
  await editEphemeral(interaction, `Created new channel ${courseName}_${channelName}`);

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