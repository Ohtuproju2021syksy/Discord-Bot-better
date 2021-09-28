const { SlashCommandBuilder } = require("@discordjs/builders");
const { updateGuide } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole } = require("../../../../config.json");
const joinedUsersCounter = require("../../../promMetrics/joinedUsersCounter");

const execute = async (interaction, client, Course) => {
  const roleString = interaction.options.getString("course").trim();
  const guild = client.guild;
  const member = guild.members.cache.get(interaction.member.user.id);
  const courseRole = guild.roles.cache.find(r => r.name === roleString);
  const courseRoles = guild.roles.cache
    .filter(r => (r.name === `${roleString} ${courseAdminRole}` || r.name === `${roleString}`))
    .map(r => r.name);

  if (!courseRoles.length) return await sendErrorEphemeral(interaction, `Invalid course name: ${roleString}`);
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) return await sendErrorEphemeral(interaction, `You are already on a ${roleString} course.`);

  await member.roles.add(courseRole);
  await sendEphemeral(interaction, `You have been added to a ${roleString} course.`);
  await updateGuide(guild, Course);

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
