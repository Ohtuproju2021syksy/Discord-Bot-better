const { sendEphemeral } = require("../utils");

const execute = async (client, interaction) => {
  sendEphemeral(client, interaction, "heippa maailma!");
};

module.exports = {
  name: "hello",
  description: "hello world command?!",
  // possible options here e.g. options: [{...}]
  execute,
};