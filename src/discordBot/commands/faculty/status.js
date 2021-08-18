const { trimCourseName } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);
  const category = channel.parent;
  const courseName = trimCourseName(category)

  console.log(channel);
  console.log(category);
  console.log(trimCourseName(category));

  return sendEphemeral(client, interaction, `Course: ${channel.name}`);
};

module.exports = {
  name: "status",
  description: "Get full status of course",
  role: facultyRole,
  execute,
};
