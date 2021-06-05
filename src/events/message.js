const { commandPrefix } = require("../../config.json");

const execute = async (message, client) => {
  if (!message.content.startsWith(commandPrefix)) return;

  let args = message.content.slice(commandPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  if (command.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
  }
  if (command.joinArgs) {
    args = args.join(" ");
  }

  try {
    await command.execute(message, args);
    await message.react("✅");
  }
  catch (error) {
    console.error(error);
    await message.react("❌");
  }
};

module.exports = {
  name: "message",
  execute,
};
