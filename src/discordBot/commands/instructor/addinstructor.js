const { SlashCommandBuilder } = require("@discordjs/builders");
const { isACourseCategory, trimCourseName } = require("../../services/service");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  await sendEphemeral(interaction, "Adding instructor...");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);
  const roleName = channel.parent ? trimCourseName(channel.parent) : "";
  let hasPermission = false;
  interaction.member._roles.forEach(roleId => {
    const role = guild.roles.cache.get(roleId);
    if (role.name === "admin" || role.name === facultyRole || role.name === `${roleName} ${courseAdminRole}`) {
      hasPermission = true;
    }
  });

  if (!hasPermission) {
    return editErrorEphemeral(interaction, "You don't have the permission to use this command!");
  }
  if (!channel.parent || !isACourseCategory(channel.parent)) {
    return editErrorEphemeral(interaction, "Command must be used in a course channel!");
  }

  const instructorRole = guild.roles.cache.find(r => r.name === `${roleName} ${courseAdminRole}`);
  const memberToPromote = guild.members.cache.get(interaction.options.getUser("user").id);
  memberToPromote.roles.add(instructorRole);
  return await editEphemeral(interaction, `Gave role '${instructorRole.name}' to ${memberToPromote.displayName}.`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addinstructor")
    .setDescription("Add instructor to the course.")
    .setDefaultPermission(false)
    .addUserOption(option =>
      option.setName("user")
        .setDescription("@User to be added as instructor")
        .setRequired(true)),
  execute,
  usage: "/addinstructor [member]",
  description: "Add instructor to the course.*",
  roles: ["admin", facultyRole, courseAdminRole],
};