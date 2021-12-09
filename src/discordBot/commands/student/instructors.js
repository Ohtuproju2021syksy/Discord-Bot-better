const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory, listCourseInstructors } = require("../../services/service");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  await sendEphemeral(interaction, "Fetching instructors...");
  const guild = client.guild;

  const category = guild.channels.cache.get(interaction.channelId).parent;
  if (!category) {
    return await editErrorEphemeral(interaction, "Use the command in a course channel.");
  }
  const roleString = getCourseNameFromCategory(category.name);

  const adminsString = await listCourseInstructors(guild, roleString, courseAdminRole, facultyRole);

  if (adminsString === "") return await editErrorEphemeral(interaction, `No instructors for ${roleString}`);

  await editEphemeral(interaction, `Here are the instructors for ${roleString}: ${adminsString}`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("instructors")
    .setDescription("Prints out the instructors of the course.*")
    .setDefaultPermission(true),
  execute,
  usage: "/instructors",
  description: "Prints out the instructors of the course.",
};
