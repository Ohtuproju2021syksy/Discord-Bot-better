const { updateGuide } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  const roleString = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);

  const courseRole = guild.roles.cache.find(r => r.name === roleString);

  const courseRoles = guild.roles.cache
    .filter(r => (r.name === `${roleString} ${courseAdminRole}` || r.name === `${roleString}`))
    .map(r => r.name);

  if (!courseRoles.length) return sendEphemeral(client, interaction, `Invalid course name: ${roleString}`);
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) return sendEphemeral(client, interaction, `You are already on a ${roleString} course.`);

  await member.roles.add(courseRole);
  sendEphemeral(client, interaction, `You have been added to a ${roleString} course.`);
  await updateGuide(guild, Course);
};

module.exports = {
  name: "join",
  description: "Join a course.",
  usage: "/join [course name]",
  args: true,
  joinArgs: true,
  guide: true,
  options: [
    {
      name: "course",
      description: "Course to join.",
      type: 3,
      choices: [],
      required: true,
    },
  ],
  execute,
};
