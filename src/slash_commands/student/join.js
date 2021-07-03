const { getRoleFromCategory } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const getChoices = () => {
  const choices = client.guild.channels.cache
    .filter(({ type, name }) => type === "category" && name.startsWith("📚"))
    .map(({ name }) => getRoleFromCategory(name))
    .map(courseName => ({ name: courseName, value: courseName }));
  // console.log(choices);
  return choices;
};

const execute = async (interaction) => {
  const roleString = interaction.data.options[0].value;
  const member = await client.guild.members.fetch(interaction.member.user.id);
  const courseRole = client.guild.roles.cache.find(r => r.name === roleString);

  const courseRoles = client.guild.roles.cache
    .filter(r => (r.name === `${roleString} admin` || r.name === `${roleString}`))
    .map(r => r.name);

  if (!courseRoles.length) return sendEphemeral(client, interaction, `Invalid course name: ${roleString}`);
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) return sendEphemeral(client, interaction, `You are already on a ${roleString} course.`);

  const teacher = member.roles.cache.find(r => r.name === "teacher");
  teacher ? client.guild.roles.cache
    .filter(r => (r.name === `${roleString} admin` || r.name === `${roleString}`))
    .map(async r => member.roles.add(r)) : await member.roles.add(courseRole);

  sendEphemeral(client, interaction, `You have been added to a ${roleString} course.`);
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
      choices: getChoices(),
      required: true,
    },
  ],
  execute,
};
