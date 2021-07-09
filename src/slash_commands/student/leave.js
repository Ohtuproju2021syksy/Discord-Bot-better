const { getRoleFromCategory, updateGuide } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const getChoices = () => {
  const choices = client.guild.channels.cache
    .filter(({ type, name }) => type === "category" && name.startsWith("📚") || name.startsWith("🔒"))
    .map(({ name }) => getRoleFromCategory(name))
    .map(courseName => ({ name: courseName, value: courseName }));
  // console.log(choices);
  return choices;
};

const execute = async (interaction) => {
  const roleString = interaction.data.options[0].value;
  const member = await client.guild.members.fetch(interaction.member.user.id);
  console.log(roleString);
  const courseRoles = client.guild.roles.cache
    .filter(role => (role.name === `${roleString} admin` || role.name === `${roleString}`))
    .map(role => role.name);


  if (!courseRoles.length) return sendEphemeral(client, interaction, `Invalid course name: ${roleString}`);
  if (!member.roles.cache.some((r) => courseRoles.includes(r.name))) return sendEphemeral(client, interaction, `You are not on a ${roleString} course.`);

  await member.roles.cache
    .filter(role => courseRoles.includes(role.name))
    .map(async role => await member.roles.remove(role));
  await member.fetch(true);

  sendEphemeral(client, interaction, `You have been removed from the ${roleString} course.`);
  updateGuide(client.guild);
};

module.exports = {
  name: "leave",
  description: "Remove you from the course, e.g. `/leave ohpe`",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  options: [
    {
      name: "course",
      description: "Course to leave.",
      type: 3,
      choices: getChoices(client),
      required: true,
    },
  ],
  execute,
};
