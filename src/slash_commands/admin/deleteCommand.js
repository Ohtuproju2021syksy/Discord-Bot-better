const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const execute = async (interaction) => {
  const commandToDelete = interaction.data.options[0].value;
  sendEphemeral(client, interaction, `Deleting command ${commandToDelete}!`);
  client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.get().then(commands => {
    commands.forEach(command => {
      if (command.name === commandToDelete) {
        client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands(command.id).delete();
      }
    });
  });
};

module.exports = {
  name: "deletecommand",
  description: "Delete all slash commands, mostly for development purposes",
  role: "admin",
  devOnly: true,
  options: [
    {
      name: "command",
      description: "Command to delete",
      type: 3,
      required: true,
    },
  ],
  execute,
};
