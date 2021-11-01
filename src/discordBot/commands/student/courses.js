const { SlashCommandBuilder } = require("@discordjs/builders");
const { findCoursesFromDb } = require("../../../db/services/courseService");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../services/message");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Fetching courses...");
  const courses = await findCoursesFromDb("fullName", models.Course, false);
  const data = courses.map((c) => {
    const fullname = c.fullName;
    return `${fullname} - \`/join ${c.name}\``;
  });
  if (data.length === 0) await editErrorEphemeral(interaction, "No courses available");
  else await editEphemeral(interaction, data.join(" \n"));
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("courses")
    .setDescription("Get public course information.")
    .setDefaultPermission(true),
  execute,
  usage: "/courses",
  description: "Get public course information.",
};
