const { SlashCommandBuilder } = require("@discordjs/builders");
const { updateGuide } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  let roleString = "";

  if (interaction.options) {
    // Interaction was a slash command
    roleString = interaction.options.getString("course").trim();
  }
  else {
    // Command was copypasted or failed to register as an interaction
    roleString = interaction.roleString;
  }

  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);
  const courseRoles = client.guild.roles.cache
    .filter(role => (role.name === `${roleString} ${courseAdminRole}` || role.name === `${roleString}`))
    .map(role => role.name);


  if (!courseRoles.length) return await sendErrorEphemeral(interaction, `Invalid course name: ${roleString}`);
  if (!member.roles.cache.some((r) => courseRoles.includes(r.name))) return await sendErrorEphemeral(interaction, `You are not on a ${roleString} course.`);

  await member.roles.cache
    .filter(role => courseRoles.includes(role.name))
    .map(async role => await member.roles.remove(role));
  await member.fetch(true);

  await sendEphemeral(interaction, `You have been removed from the ${roleString} course.`);
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