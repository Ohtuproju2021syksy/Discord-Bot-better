const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  const guild = client.guild;

  let roleString;
  if (interaction.data.options) {
    roleString = interaction.data.options[0].value.toLowerCase().trim();
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

  const instructorRole = guild.roles.cache.find(r => r.name === `${roleString} ${courseAdminRole}`);
  if (!instructorRole) return sendEphemeral(client, interaction, `No instructors for ${roleString}`);

  const adminsString = instructorRole.members
    .map(member => member.nickname || member.user.username)
    .join(", ");
  if (!adminsString) return sendEphemeral(client, interaction, `No instructors for ${roleString}`);

  sendEphemeral(client, interaction, `Here are the instructors for ${roleString}: ${adminsString}`);
};

module.exports = {
  name: "instructors",
  description: "Prints out the instructors of the course.",
  usage: "<course name>",
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
