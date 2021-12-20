const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory, listCourseInstructors } = require("../../services/service");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole, facultyRole } = require("../../../../config.json");
const { findCourseFromDb } = require("../../../db/services/courseService");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Fetching instructors...");
  const guild = client.guild;

  const category = guild.channels.cache.get(interaction.channelId).parent;
  const courseName = category?.name ? getCourseNameFromCategory(category.name) : null;
  const course = await findCourseFromDb(courseName, models.Course);
  if (!category || !course) {
    return await editErrorEphemeral(interaction, "Use the command in a course channel.");
  }

  const adminsString = await listCourseInstructors(guild, courseName, courseAdminRole, facultyRole);

  if (adminsString === "") return await editErrorEphemeral(interaction, `No instructors for ${courseName}`);

  await editEphemeral(interaction, `Here are the instructors for ${courseName}: ${adminsString}`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("instructors")
    .setDescription("Prints out the instructors of the course.*")
    .setDefaultPermission(true),
  execute,
  usage: "/instructors",
  description: "Prints out the instructors of the course.*",
};
