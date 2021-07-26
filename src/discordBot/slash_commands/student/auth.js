const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {
  sendEphemeral(client, interaction, `${process.env.BACKEND_SERVER_URL}/authenticate_faculty`);
};

module.exports = {
  name: "auth",
  description: "Get auth url to request teacher role",
  execute,
};