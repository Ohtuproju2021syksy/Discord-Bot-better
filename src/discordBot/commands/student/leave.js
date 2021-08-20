const { updateGuide } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const roleString = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);
  const courseRoles = client.guild.roles.cache
    .filter(role => (role.name === `${roleString} ${courseAdminRole}` || role.name === `${roleString}`))
    .map(role => role.name);


  if (!courseRoles.length) return sendEphemeral(client, interaction, `Invalid course name: ${roleString}`);
  if (!member.roles.cache.some((r) => courseRoles.includes(r.name))) return sendEphemeral(client, interaction, `You are not on a ${roleString} course.`);

  await member.roles.cache
    .filter(role => courseRoles.includes(role.name))
    .map(async role => await member.roles.remove(role));
  await member.fetch(true);

  sendEphemeral(client, interaction, `You have been removed from the ${roleString} course.`);
  await updateGuide(client.guild, Course);
};

module.exports = {
  name: "leave",
  description: "Remove you from the course, e.g., `/leave ohpe`",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  options: [
    {
      name: "course",
      description: "Course to leave.",
      type: 3,
      choices: [],
      required: true,
    },
  ],
  execute,
};
