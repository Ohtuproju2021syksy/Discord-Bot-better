const { possibleRolesArray, getRoleFromCategory } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client: Clientti } = require("../../index");

const getChoices = () => {
  const guild = Clientti.guilds.cache.get(process.env.GUILD_ID);
  const courseNames = guild.channels.cache
    .filter(({ type, name }) => type === "category" && name.startsWith("📚"))
    .map(({ name }) => getRoleFromCategory(name));

  const choices = courseNames.map(courseName => ({ name: courseName, value: courseName }));
  return choices;
};

const execute = async (client, interaction) => {
  const roleString = interaction.data.options[0].value;

  const guild = client.guild;
  const member = guild.members.cache.get(interaction.member.user.id);

  const roles = possibleRolesArray(guild);
  const role = roles.find(
    (r) => r.name === roleString,
  );
  if (!role) throw new Error("Role does not exist or is not available");
  await member.roles.add(role);
  await member.fetch(true);

  sendEphemeral(client, interaction, `Joined ${roleString}`);
};

module.exports = {
  name: "join",
  description: "Join a course.",
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
    },
  ],
  execute,
};
