const prefix = process.env.PREFIX;

const execute = async (message, client, Course) => {
  if ((!message.content.startsWith(prefix) || message.channel.name !== "commands") && !message.content.startsWith("/")) return;
  let args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  args = args.map(arg => arg.toLowerCase().trim());

  if (client.slashCommands.has(commandName)) {
    const command = client.slashCommands.get(commandName);
    if (commandName == "join" || commandName == "leave") {
      const roleString = args.shift().toLowerCase().trim();
      if (!roleString) return;
      message.roleString = roleString;
      command.execute(message, client, Course);
      return;
    }
  }

  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);
  console.log(command.role);
  if (command.role && !message.member.roles.cache.find(r => r.name === command.role)) return;
  if (command.args && !args.length) {
    return message.channel.send({ content: `You didn't provide any arguments, ${message.author}!`, reply: { messageReference: message.id } });
  }
  try {
    await command.execute(message, args, Course);
    if (command.emit) await client.emit("COURSES_CHANGED", Course);
    await message.react("✅");
  }
  catch (error) {
    // console.error(error);
    await message.react("❌");
  }
};

module.exports = {
  name: "messageCreate",
  execute,
};
