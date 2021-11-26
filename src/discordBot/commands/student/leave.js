const { SlashCommandBuilder } = require("@discordjs/builders");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../services/message");
const { findUserByDiscordId } = require("../../../db/services/userService");
const { removeCourseMemberFromDb, findAllCourseMembersByUser } = require("../../../db/services/courseMemberService");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Leaving course...");
  const roleString = interaction.options.getString("course").trim();

  const course = await findCourseFromDb(roleString, models.Course);
  if (!course) {
    return await editErrorEphemeral(interaction, `Invalid course name: ${roleString}`);
  }

  const user = await findUserByDiscordId(interaction.member.user.id, models.User);
  const courseMembers = await findAllCourseMembersByUser(user.id, models.CourseMember);
  const coursesJoinedByUser = courseMembers.map(cm => cm.courseId);

  if (!coursesJoinedByUser.includes(course.id)) {
    return await editErrorEphemeral(interaction, `You are not on the ${roleString} course.`);
  }

  await removeCourseMemberFromDb(user.id, course.id, models.CourseMember);

  await editEphemeral(interaction, `You have been removed from the ${roleString} course.`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the course.")
    .setDefaultPermission(true)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Course to leave.")
        .setRequired(true)),
  execute,
  usage: "/leave",
  description: "Leave the course. After writing '/leave', the bot will give you a list of courses to choose from",
};