const { SlashCommandBuilder } = require("@discordjs/builders");
const { updateGuide } = require("../../services/service");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const roleString = interaction.options.getString("test").toLowerCase().trim();

  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);

  const courseRole = guild.roles.cache.find(r => r.name === roleString);

  const courseRoles = guild.roles.cache
    .filter(r => (r.name === `${roleString} ${courseAdminRole}` || r.name === `${roleString}`))
    .map(r => r.name);

  if (!courseRoles.length) return await interaction.reply({ content: `Error: Invalid course name: ${roleString}`, ephemeral: true });
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) return await interaction.reply({ content: `Error: You are already on a ${roleString} course.`, ephemeral: true });

  await member.roles.add(courseRole);
  await interaction.reply({ constent: `You have been added to a ${roleString} course.`, ephemeral: true });
  await updateGuide(guild, Course);
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
