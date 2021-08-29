const { SlashCommandBuilder } = require("@discordjs/builders");

const { updateGuide } = require("../../services/service");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const roleString = interaction.options.getString("course").toLowerCase().trim();

  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);
  const courseRoles = client.guild.roles.cache
    .filter(role => (role.name === `${roleString} ${courseAdminRole}` || role.name === `${roleString}`))
    .map(role => role.name);


  if (!courseRoles.length) return await interaction.reply({ content: `Error: Invalid course name: ${roleString}`, ephemeral: true });
  if (!member.roles.cache.some((r) => courseRoles.includes(r.name))) return await interaction.reply({ content: `Error: You are not on a ${roleString} course.`, ephemeral: true });

  await member.roles.cache
    .filter(role => courseRoles.includes(role.name))
    .map(async role => await member.roles.remove(role));
  await member.fetch(true);

  await interaction.reply({ content: `You have been removed from the ${roleString} course.`, ephemeral: true });
  await updateGuide(client.guild, Course);
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
  usage: "/leave [course name]",
  description: "Leave the course.",
};
