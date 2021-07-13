const { updateGuide } = require("../../services/service");
const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {
  const roleString = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);

  const courseRole = guild.roles.cache.find(r => r.name === roleString);

  const courseRoles = guild.roles.cache
    .filter(r => (r.name === `${roleString} admin` || r.name === `${roleString}`))
    .map(r => r.name);

  // if (!courseRoles.length) return sendEphemeral(client, interaction, `Invalid course name: ${roleString}`);
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) return sendEphemeral(client, interaction, `You are already on a ${roleString} course.`);

  const teacher = member.roles.cache.find(r => r.name === "teacher");
  teacher ? guild.roles.cache
    .filter(r => (r.name === `${roleString} admin` || r.name === `${roleString}`))
    .map(async r => member.roles.add(r)) : await member.roles.add(courseRole);
  sendEphemeral(client, interaction, `You have been added to a ${roleString} course.`);
  await updateGuide(guild);
};

module.exports = {
  name: "join",
  description: "Join a course, e.g. `/join ohpe`",
  usage: "[course name]",
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
