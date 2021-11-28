const { SlashCommandBuilder } = require("@discordjs/builders");
const { editEphemeral, sendEphemeral, editErrorEphemeral } = require("../../services/message");
const { getWorkshopInfo, getCourseNameFromCategory } = require("../../services/service");
const { findCourseFromDb } = require("../../../db/services/courseService");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Fetching info...");
  const courseModel = models.Course;
  const guild = client.guild;
  const channel = await guild.channels.cache.get(interaction.channelId);
  if (!channel.parent) {
    return await editErrorEphemeral(interaction, "Course not found, execution stopped.");
  }

  const parentCourse = await findCourseFromDb(getCourseNameFromCategory(channel.parent.name), courseModel);

  if (!parentCourse) {
    return await editErrorEphemeral(interaction, "Command must be used in a course channel!");
  }

  const messageText = await getWorkshopInfo(parentCourse.code);
  await editEphemeral(interaction, messageText);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("workshops")
    .setDescription("Get workshops information.")
    .setDefaultPermission(true),
  execute,
  usage: "/workshops",
  description: "Get workshops information.",
};
