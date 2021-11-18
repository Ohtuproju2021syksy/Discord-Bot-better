const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  createInvitation,
  setCoursePositionABC,
  containsEmojis } = require("../../services/service");
const {
  createCourseToDatabase,
  findCourseFromDb,
  findCourseFromDbWithFullName,
  updateGuide } = require("../../../db/services/courseService");
const { createDefaultChannelsToDatabase } = require("../../../db/services/channelService");
const { sendErrorEphemeral, sendEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");

const getDefaultChannelObjects = (courseName) => {
  courseName = courseName.replace(/ /g, "-");

  return [
    {
      name: `${courseName}_announcement`,
      type: "GUILD_TEXT",
    },
    {
      name: `${courseName}_general`,
      type: "GUILD_TEXT",
    },
    {
      name: `${courseName}_voice`,
      type: "GUILD_VOICE",
    },
  ];
};

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
  const guild = client.guild;

  const channelObjects = getDefaultChannelObjects(courseName);
  const course = await createCourseToDatabase(courseCode, courseFullName, courseName, models.Course);
  const categoryName = `📚 ${course.name}`;

  const defaultChannelObjects = channelObjects.map(channelObject => {
    const voiceChannel = channelObject.type === "GUILD_VOICE";
    return {
      courseId: course.id,
      name: channelObject.name,
      defaultChannel: true,
      voiceChannel: voiceChannel,
    };
  });

  await createDefaultChannelsToDatabase(defaultChannelObjects, models.Channel);
  await setCoursePositionABC(guild, categoryName);
  await createInvitation(guild, courseName);
  await editEphemeral(interaction, `Created course ${courseName}.`);
  await client.emit("COURSES_CHANGED", models.Course);
  await updateGuide(client.guild, models.Course);
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
