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
  const guild = client.guild;
  const guideChannel = guild.channels.cache.find((c) => c.name === "guide");
  const copyPasteGuideReply = "You can try typing `/join` and I'll offer you a helpful list of courses to click from.\n" +
    "Please also read <#" + guideChannel + "> for more info on commands and available courses.\n" +
    "You can also type `/help` to view a helpful *(pun intended)* list of commands.\n" +
    "Note that you have to **manually** type the commands; I rarely understand copy-pasted commands!";
  const channel = interaction.channel;

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
    if (!course || course.private) {
      return await sendReplyMessage(interaction, channel, "Hey, <@" + interaction.author + ">, I couldn't find a course with name **" + roleString + "**.\n" + copyPasteGuideReply);
    }
    const fullName = course.fullName;
    message = "Hey, <@" + interaction.author + ">, I added you to **" + fullName + "**, hopefully I got that correct.\n" + copyPasteGuideReply;
  }

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
      return await sendReplyMessage(interaction, channel, "Hey, <@" + interaction.author + ">. The course name **" + roleString + "** you gave was invalid.\n" + copyPasteGuideReply);
    }
  }
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) {
    if (interaction.options) {
      return await editErrorEphemeral(interaction, `You are already on the ${roleString} course.`);
    }
    else {
      return await sendReplyMessage(interaction, channel, "Hey, <@" + interaction.author + ">, you are already on the **" + roleString + "** course.\n" + copyPasteGuideReply);
    }
  }

  let user = await findUserByDiscordId(interaction.member.user.id, models.User);
  if (!course) {
    course = await findCourseFromDb(roleString, models.Course);
  }
  if (!user) {
    await createUserToDatabase(interaction.member.user.id, interaction.member.user.username, models.User);
    user = await findUserByDiscordId(interaction.member.user.id, models.User);
    await createCourseMemberToDatabase(user.id, course.id, models.CourseMember);
  }

  await createCourseMemberToDatabase(user.id, course.id, models.CourseMember);

  await member.roles.add(courseRole);
  if (interaction.options) {
    await editEphemeral(interaction, message);
  }
  else {
    await sendReplyMessage(interaction, channel, message);
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
  usage: "/join",
  description: "Join a course. After writing '/join', the bot will give you a list of courses to choose from",
};