const execute = async (interaction, client, Groups, Course) => {
  const commandName = interaction.data.name.toLowerCase();
  try {
    await client.slashCommands.get(commandName).command.execute(interaction, client, Groups, Course);
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