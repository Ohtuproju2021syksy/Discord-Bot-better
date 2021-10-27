const { SlashCommandBuilder } = require("@discordjs/builders");
const { editEphemeral, editErrorEphemeral, sendEphemeral, sendReplyMessage } = require("../../services/message");
const { updateGuide, findCourseFromDb } = require("../../../db/services/courseService");
const { courseAdminRole } = require("../../../../config.json");
const { findUserByDiscordId, createUserToDatabase } = require("../../../db/services/userService");
const { createCourseMemberToDatabase } = require("../../../db/services/courseMemberService");
const joinedUsersCounter = require("../../../promMetrics/joinedUsersCounter");

const execute = async (interaction, client, models) => {
  let roleString = "";
  let message = "";
  let course;

  if (interaction.options) {
    // Interaction was a slash command
    await sendEphemeral(interaction, "Joining course...");
    roleString = interaction.options.getString("course").trim();
    message = `You have been added to the ${roleString} course.`;
  }
  else {
    // Command was copypasted or failed to register as an interaction
    roleString = interaction.roleString;
    course = await findCourseFromDb(roleString, models.Course);
    if (!course) {
      return await sendReplyMessage(interaction, `Hey! I couldn't find a course with name ${roleString}, try typing /join and I'll offer you a helpful list of courses to select from.`);
    }
    const fullName = course.fullName;
    message = `Hey there! I tried my best to send you to the right place! ${fullName}, right? \n You can also try writing /join and I'll offer you a helpful list of courses to click from!`;
  }

  const guild = client.guild;
  const member = guild.members.cache.get(interaction.member.user.id);
  const courseRole = guild.roles.cache.find(r => r.name === roleString);

  const courseRoles = guild.roles.cache
    .filter(r => (r.name === `${roleString} ${courseAdminRole}` || r.name === `${roleString}`))
    .map(r => r.name);

  if (!courseRoles.length) {
    if (interaction.options) {
      return await editErrorEphemeral(interaction, `Invalid course name: ${roleString}`);
    }
    else {
      return await sendReplyMessage(interaction, `Invalid course name: ${roleString}`);
    }
  }
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) {
    if (interaction.options) {
      return await editErrorEphemeral(interaction, `You are already on the ${roleString} course.`);
    }
    else {
      return await sendReplyMessage(interaction, `You are already on the ${roleString} course.`);
    }
  }

  const user = await findUserByDiscordId(interaction.member.user.id, models.User);
  if (!course) {
    course = await findCourseFromDb(roleString, models.Course);
  }
  if (!user) {
    await createUserToDatabase(interaction.member.user.id, interaction.member.user.username, models.User);
    const newUser = await findUserByDiscordId(interaction.member.user.id, models.User);
    await createCourseMemberToDatabase(newUser.id, course.id, models.CourseMember);
  }

  await createCourseMemberToDatabase(user.id, course.id, models.CourseMember);

  await member.roles.add(courseRole);
  if (interaction.options) {
    await editEphemeral(interaction, message);
  }
  else {
    await sendReplyMessage(interaction, message);
  }
  await updateGuide(guild, models.Course);
  joinedUsersCounter.inc({ course: roleString });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a course.")
    .setDefaultPermission(true)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Course to join.")
        .setRequired(true)),
  execute,
  usage: "/join [course name]",
  description: "Join a course.",
};