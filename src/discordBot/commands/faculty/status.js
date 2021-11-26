const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  getCourseNameFromCategory,
  createCourseInvitationLink,
  downloadImage,
  listCourseInstructors,
  isCourseCategory,
} = require("../../services/service");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { findChannelsByCourse } = require("../../../db/services/channelService");
const { editErrorEphemeral, sendEphemeral, editEphemeralForStatus } = require("../../services/message");
const { facultyRole, courseAdminRole } = require("../../../../config.json");
const { findAllCourseMembers } = require("../../../db/services/courseMemberService");


const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Fetching status...");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!await isCourseCategory(channel?.parent, models.Course)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const courseRole = getCourseNameFromCategory(channel.parent, guild);
  const course = await findCourseFromDb(courseRole, models.Course);

  const members = await findAllCourseMembers(course.id, models.CourseMember);
  const count = members.length;

  let instructors = await listCourseInstructors(guild, courseRole, courseAdminRole);
  if (instructors === "") {
    instructors = `No instructors for ${courseRole}`;
  }
  const channels = await findChannelsByCourse(course.id, models.Channel);

  const blockedChannels = channels
    .filter(c => !c.bridged)
    .map(c => c.name);

  const blockedChannelMessage = (blockedChannels && blockedChannels.length) ?
    `${blockedChannels.join(", ")}` :
    "No blocked channels";

  await downloadImage(course.name);

  return await editEphemeralForStatus(interaction, `
Course: ${course.name}
Fullname: ${course.fullName}
Code: ${course.code}
Hidden: ${course.private}
Invitation Link: ${createCourseInvitationLink(course.name)}
Bridge blocked on channels: ${blockedChannelMessage}

Instructors: ${instructors}
Members: ${count}
  `);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Get full status of course.*")
    .setDefaultPermission(false),
  execute,
  usage: "/status",
  description: "Get full status of course.*",
  roles: ["admin", facultyRole],
};
