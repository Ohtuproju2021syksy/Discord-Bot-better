const { client } = require("../../index");

const execute = async (message, args) => {
  client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.get().then(commands => {
    commands.forEach(command => {
      if (command.name === args[0]) {
        client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands(command.id).delete();
      }
    });
  });
};

module.exports = {
  prefix: true,
  name: "deletecommand",
  description: "Delete a slash command, mostly for development purposes",
  role: "admin",
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
