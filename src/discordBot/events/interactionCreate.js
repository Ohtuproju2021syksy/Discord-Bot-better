const { sendErrorReport, sendErrorEphemeral } = require("../services/message");

const execute = async (interaction, client, Course) => {
  if (!interaction.isCommand()) return;
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client, Course);
  }
  catch (error) {
    console.error(error);
    await sendErrorReport(interaction, client, error);
    await sendErrorEphemeral("There was an error while executing this command - Error report sent to administrators!");
  }
};

module.exports = {
  name: "interactionCreate",
  execute,
};