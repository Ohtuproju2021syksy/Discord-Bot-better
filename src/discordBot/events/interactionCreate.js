const execute = async (interaction, client) => {
  const commandName = interaction.data.name.toLowerCase();
  await client.slashCommands.get(commandName).command.execute(interaction, client);
};

module.exports = {
  name: "INTERACTION_CREATE",
  ws: true,
  execute,
};