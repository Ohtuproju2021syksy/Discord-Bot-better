const { SlashCommandBuilder } = require("@discordjs/builders");
const { containsEmojis } = require("../../services/service");
const {
  createCourseToDatabase,
  findCourseFromDb,
  findCourseFromDbWithFullName } = require("../../../db/services/courseService");
const { sendErrorEphemeral, sendEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, models) => {
  const courseCode = interaction.options.getString("coursecode").replace(/\s/g, "");
  const courseFullName = interaction.options.getString("full_name").trim();
  if (await findCourseFromDbWithFullName(courseFullName, models.Course)) return await sendErrorEphemeral(interaction, "Course fullname must be unique.");

  let courseName;
  let errorMessage;
  if (!interaction.options.getString("nick_name")) {
    courseName = courseCode.toLowerCase();
    errorMessage = "Course code must be unique.";
  }
  else {
    courseName = interaction.options.getString("nick_name").replace(/\s/g, "").toLowerCase();
    errorMessage = "Course nick name must be unique.";
  }

  if (containsEmojis(courseCode) || containsEmojis(courseFullName) || containsEmojis(courseName)) {
    return await sendErrorEphemeral(interaction, "Emojis are not allowed!");
  }

  const courseNameConcat = courseCode + " - " + courseFullName + " - " + courseName;
  if (courseNameConcat.length >= 99) {
    return await sendErrorEphemeral(interaction, "Course code, name and nickname are too long!");
  }

  if (await findCourseFromDb(courseName, models.Course)) return await sendErrorEphemeral(interaction, errorMessage);
  await sendEphemeral(interaction, "Creating course...");

  await createCourseToDatabase(courseCode, courseFullName, courseName, models.Course);
  await editEphemeral(interaction, `Created course ${courseName}.`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create_course")
    .setDescription("Create a new course.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("coursecode")
        .setDescription("Course coursecode")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("full_name")
        .setDescription("Course full name")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("nick_name")
        .setDescription("Course nick name")
        .setRequired(false)),
  execute,
  usage: "/create_course [course name]",
  description: "Create a new course.",
  roles: ["admin", facultyRole],
};
