const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory, findOrCreateChannel } = require("../../services/service");
const { createChannelToDatabase, findChannelFromDbByName, countChannelsByCourse } = require("../../../db/services/channelService");
const { findCourseFromDb } = require("../../../db/services/courseService");
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

  const courseModel = models.Course;
  const channelModel = models.Channel;
  const channelName = interaction.options.getString("channel").trim().replace(/ /g, "-");

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel.parent) {
    return await editErrorEphemeral(interaction, "Course not found, can not create new channel.");
  }

  const parentChannel = await findCourseFromDb(getCourseNameFromCategory(channel.parent.name), courseModel);

  if (!parentChannel) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not create new channel.");
  }

  if (await countChannelsByCourse(parentChannel.id, channelModel) >= 13) {
    return await editErrorEphemeral(interaction, "Maximum added text channel amount is 10");
  }

  if (await findChannelFromDbByName(`${parentChannel.name}_${channelName}`, channelModel)) {
    return await editErrorEphemeral(interaction, "Channel with given name already exists");
  }

  const category = channel.parent;
  const student = await guild.roles.cache.find((role) => role.name === parentChannel.name);
  const admin = await guild.roles.cache.find((role) => role.name === `${parentChannel.name} ${courseAdminRole}`);

  const channelObjects = getChannelObjects(guild, admin, student, parentChannel.name, channelName, category);
  await Promise.all(channelObjects.map(
    async channelObject => await findOrCreateChannel(channelObject, guild),
  ));
  const courseFromDb = await findCourseFromDb(parentChannel.name, courseModel);
  const trimmedCourseName = parentChannel.name.replace(/ /g, "-");
  await createChannelToDatabase({ courseId: courseFromDb.id, name: `${trimmedCourseName}_${channelName}` }, channelModel);
  await editEphemeral(interaction, `Created new channel ${trimmedCourseName}_${channelName}`);

};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create_channel")
    .setDescription("Create a new text channel to course.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("channel")
        .setDescription("Create a new text channel")
        .setRequired(true)),
  execute,
  usage: "/create_channel [channel name]",
  description: "Create a new text channel to course.*",
  roles: ["admin", facultyRole],
};
