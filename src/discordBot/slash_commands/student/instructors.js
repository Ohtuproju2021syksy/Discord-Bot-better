const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const execute = async (interaction) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);

  let roleString;
  if (interaction.data.options) {
    roleString = interaction.data.options[0].value;
  }
  else {
    const category = guild.channels.cache.get(interaction.channel_id).parent;
    if (!category) {
      return sendEphemeral(client, interaction, "Provide course name as argument or use the command in course channel.");
    }
    else {
      roleString = getRoleFromCategory(category.name);
    }
  }

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
