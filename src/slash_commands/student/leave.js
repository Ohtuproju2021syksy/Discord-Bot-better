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
  const member = client.guild.members.cache.get(interaction.member.user.id);

  const courseRoles = client.guild.roles.cache
    .filter(role => (role.name === `${roleString} admin` || role.name === `${roleString}`))
    .map(role => role.name);

  if (!courseRoles.length) return sendEphemeral(client, interaction, `Invalid course name: ${roleString}`);
  if(!member.roles.cache.some((r) => courseRoles.includes(r.name))) return sendEphemeral(client, interaction, `You are not in ${roleString} channel.`);
  await member.roles.cache
    .filter(role => courseRoles.includes(role.name))
    .map(async role => await member.roles.remove(role));
  await member.fetch(true);
  sendEphemeral(client, interaction, `Left ${roleString} channel.`);
};

module.exports = {
  name: "leave",
  description: "Remove you from the course, e.g. `!leave ohpe`",
  args: true,
  joinArgs: true,
  guide: true,
  options: [
    {
      name: "course",
      description: "Course to join.",
      type: 3,
      choices: getChoices(client),
      required: true,
    },
  ],
  execute,
};