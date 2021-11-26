const { SlashCommandBuilder } = require("@discordjs/builders");
const { editEphemeral, editErrorEphemeral, sendEphemeral, sendReplyMessage } = require("../../services/message");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { findUserByDiscordId, createUserToDatabase } = require("../../../db/services/userService");
const { createCourseMemberToDatabase, findAllCourseMembersByUser } = require("../../../db/services/courseMemberService");
const joinedUsersCounter = require("../../../promMetrics/joinedUsersCounter");

const execute = async (interaction, client, models) => {
  let roleString = "";
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
  }
  else {
    // Command was copypasted or failed to register as an interaction
    roleString = interaction.roleString;
  }
  const course = await findCourseFromDb(roleString, models.Course);
  if (!course || course.private) {
    if (interaction.options) {
      return await editErrorEphemeral(interaction, `Invalid course name: ${roleString}`);
    }
    else {
      return await sendReplyMessage(interaction, channel, "Hey, <@" + interaction.author + ">. The course name **" + roleString + "** you gave was invalid.\n" + copyPasteGuideReply);
    }
  }

  let user = await findUserByDiscordId(interaction.member.user.id, models.User);
  if (!user) {
    await createUserToDatabase(interaction.member.user.id, interaction.member.user.username, models.User);
    user = await findUserByDiscordId(interaction.member.user.id, models.User);
  }

  const courseMembers = await findAllCourseMembersByUser(user.id, models.CourseMember);
  const coursesJoinedByUser = courseMembers.map(cm => cm.courseId);

  if (coursesJoinedByUser.includes(course.id)) {
    if (interaction.options) {
      return await editErrorEphemeral(interaction, `You are already on the ${roleString} course.`);
    }
    else {
      return await sendReplyMessage(interaction, channel, "Hey, <@" + interaction.author + ">, you are already on the **" + roleString + "** course.\n" + copyPasteGuideReply);
    }
  }

  await createCourseMemberToDatabase(user.id, course.id, models.CourseMember);

  let message = "";
  if (interaction.options) {
    message = `You have been added to the ${roleString} course.`;
    await editEphemeral(interaction, message);
  }
  else {
    message = "Hey, <@" + interaction.author + ">, I added you to **" + course.fullName + "**, hopefully I got that correct.\n" + copyPasteGuideReply;
    await sendReplyMessage(interaction, channel, message);
  }

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