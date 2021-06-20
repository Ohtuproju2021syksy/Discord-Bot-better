const { sendEphemeral } = require("../utils");

const execute = async (client, interaction) => {
  sendEphemeral(client, interaction, "Deleting all the commands!");
  client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.get().then(commands => {
    commands.forEach(command => {
      client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands(command.id).delete();
    });
  });
};

module.exports = {
  name: "deletecommands",
  description: "deletecommands for admins, mostly for development purposes",
  role: ["admin"],
  // possible options here e.g. options: [{...}]
  execute,
};