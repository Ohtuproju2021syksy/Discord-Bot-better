const { handleBridgeMessage } = require("../../bridge/index");
const { getRoleFromCategory } = require("../services/service");

const prefix = process.env.PREFIX;

const execute = async (message, client, Groups) => {
  if (!message.content.startsWith(prefix) || message.channel.name !== "commands") {
    if (message?.channel?.parent) {
      const courseName = getRoleFromCategory(message.channel.parent.name);
      return handleBridgeMessage(message, courseName, Groups);
    }
    return;
  }

  let args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  args = args.map(arg => arg.toLowerCase().trim());
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  if (command.role && !message.member.roles.cache.find(r => r.name === command.role)) return;
  if (command.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
  }

  try {
    await command.execute(message, args, Groups);
    await message.react("✅");
  }
  catch (error) {
    // console.error(error);
    await message.react("❌");
  }
};

module.exports = {
  name: "message",
  execute,
};
