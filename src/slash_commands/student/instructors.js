const { getRoleFromCategory } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const execute = async (interaction) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const roleString = interaction.data.options ?
    interaction.data.options[0].value :
    guild.channels.cache.filter(c => c.id === interaction.channel_id)
      .map(c => getRoleFromCategory(c.parent.name));

  const courseAdminRole = guild.roles.cache.find(r => r.name === `${roleString} admin`);
  if (!courseAdminRole) return sendEphemeral(client, interaction, `No instructors for ${roleString}`);

  const adminsString = courseAdminRole.members
    .map(member => member.nickname || member.user.username)
    .join(", ");
  if (!adminsString) return sendEphemeral(client, interaction, `No instructors for ${roleString}`);

  sendEphemeral(client, interaction, `Here are the instructors for ${roleString}: ${adminsString}`);
};

module.exports = {
  name: "instructors",
  description: "Prints out the instructors of the course. This command is available in most channels.",
  args: false,
  joinArgs: false,
  options: [
    {
      name: "command",
      description: "command instructions",
      type: 3,
      required: false,
    },
  ],
  execute,
};
