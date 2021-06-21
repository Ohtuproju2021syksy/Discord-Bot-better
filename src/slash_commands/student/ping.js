const { sendEphemeral } = require("../utils");

const execute = async (client, interaction) => {
  sendEphemeral(client, interaction, "pong!");
};

module.exports = {
  name: "ping",
  description: "ping command for everyone",
  execute,
};
