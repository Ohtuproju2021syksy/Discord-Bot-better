const {
  getRoleFromCategory,
  createCourseInvitationLink,
  trimCourseName,
  findCourseFromDb,
} = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  if (!channel?.parent?.name?.startsWith("🔒") && !channel?.parent?.name?.startsWith("📚")) {
    return sendEphemeral(client, interaction, "This is not a course category, can not execute the command");
  }

  const categoryName = trimCourseName(channel.parent, guild);
  const course = await findCourseFromDb(categoryName, Course);

  const courseRole = getRoleFromCategory(categoryName);
  const instructorRole = `${courseRole} instructor`;
  const count = guild.roles.cache.find(
    (role) => role.name === courseRole,
  )?.members.size;

  const instructors = guild.roles.cache.find(
    (role) => role.name === instructorRole,
  )?.members.map(m => m.displayName);

  const instructorMessage = (instructors && instructors.length) ?
    `${instructors.join(", ")}` :
    "No instructors";


  return sendEphemeral(client, interaction, `
Course: ${course.name}
Fullname: ${course.fullName}
Code: ${course.code}
Invitation Link: ${createCourseInvitationLink(course.name)}

Instructors: ${instructorMessage}
Members: ${count}
  `);
};

module.exports = {
  name: "status",
  description: "Get full status of course",
  role: facultyRole,
  execute,
};
