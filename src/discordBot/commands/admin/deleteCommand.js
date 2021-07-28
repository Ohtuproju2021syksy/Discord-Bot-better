const execute = async (message, args) => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    const client = message.client;
    client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.get().then(commands => {
      commands.forEach(command => {
        if (command.name === args[0]) {
          client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands(command.id).delete();
        }
      });
    });
  }
};

module.exports = {
  prefix: true,
  name: "deletecommand",
  description: "Delete a slash command",
  role: "admin",
  usage: "[command name]",
  args: true,
  execute,
};
