const { isACourseCategory, trimCourseName } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);
  const roleName = channel.parent ? trimCourseName(channel.parent) : "";

  let hasPermission = false;
  interaction.member.roles.forEach(roleId => {
    const role = guild.roles.cache.get(roleId);
    if (role.name === "admin" || role.name === facultyRole || role.name === `${roleName} ${courseAdminRole}`) {
      hasPermission = true;
    }
  });

  if (!hasPermission) {
    return sendEphemeral(client, interaction, "You don't have the permission to use this command.");
  }

  if (!channel.parent || !isACourseCategory(channel.parent)) {
    return sendEphemeral(client, interaction, "Command must be used in a course channel.");
  }

  const instructorRole = guild.roles.cache.find(r => r.name === `${roleName} ${courseAdminRole}`);
  const memberToPromote = guild.members.cache.get(interaction.data.options[0].value);

  memberToPromote.roles.add(instructorRole);
  return sendEphemeral(client, interaction, `Gave role '${instructorRole.name}' to ${memberToPromote.user.username}.`);
};

module.exports = {
  name: "addinstructor",
  description: "Add instructor to the course.",
  role: courseAdminRole,
  options: [
    {
      name: "user",
      description: "@User to be added as instructor",
      type: 6,
      required: true,
    },
  ],
  execute,
};