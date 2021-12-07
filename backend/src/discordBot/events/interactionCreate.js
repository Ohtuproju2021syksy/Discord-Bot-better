const { sendErrorReport, sendErrorEphemeral } = require("../services/message");
const { logError } = require("../services/logger");

const execute = async (interaction, client, models) => {
  if (!interaction.isCommand()) return;
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client, models);
  }
  catch (error) {
    console.error(error);
    logError(error);
    await sendErrorReport(interaction, client, error.toString());
    await sendErrorEphemeral(interaction, "There was an error while executing this command - Error report sent to administrators!");
  }
};

module.exports = {
  name: "interactionCreate",
  execute,
};