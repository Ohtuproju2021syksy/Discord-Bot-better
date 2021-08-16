const execute = async (interaction, client, Course) => {
  const commandName = interaction.data.name.toLowerCase();
  try {
    await client.slashCommands.get(commandName).command.execute(interaction, client, Course);
  }
  catch (error) {
    console.log(error);
  }
};

module.exports = {
  name: "INTERACTION_CREATE",
  ws: true,
  execute,
};