const prefix = process.env.PREFIX;

const execute = (message, args) => {
  const data = [];
  const commands = message.client.commands;

  if (!args.length) {
    data.push("Here's a list of all my commands:");
    data.push(commands.map(command => command.name).join(", "));
    data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
    return message.channel.send(data.join(" "), { split: true });
  }

  const name = args[0].toLowerCase();
  const command = commands.get(name);

  if (!command) {
    return message.reply("that's not a valid command!");
  }

  data.push(`**Name:** ${command.name}`);

  if (command.description) data.push(`**Description:** ${command.description}`);
  if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

  message.channel.send(data, { split: true });
};

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command.",
  args: false,
  usage: "[command name]",
  execute,
};
