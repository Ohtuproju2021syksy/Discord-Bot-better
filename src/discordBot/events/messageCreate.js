const { sendReplyMessage } = require("../services/message");
const { logError } = require("./../services/logger");
const prefix = process.env.PREFIX;

const execute = async (message, client, models) => {

  let args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  args = args.map(arg => arg.toLowerCase().trim());
  const guideChannel = client.guild.channels.cache.find((c) => c.name === "guide");
  const copyPasteGuideReply = "Sorry, <@" + message.author + ">, I didn't quite catch what you meant.\nPlease read <#" + guideChannel + "> for more info on commands and available courses.\n" +
  "You can also type `/help` to view a helpful *(pun intended)* list of commands.\n" +
  "Note that you have to **manually** type the commands; I rarely understand copy-pasted commands!";

  const channel = message.channel;

  if (message.content.startsWith("/")) {
    // Copypasted slash command
    if (client.slashCommands.has(commandName)) {
      const command = client.slashCommands.get(commandName);
      if (commandName == "join") {
        const roleString = args.shift()?.toLowerCase()?.trim();
        if (!roleString) return sendReplyMessage(message, channel, copyPasteGuideReply);
        // Command execution handles permissions and whether the course is valid
        message.roleString = roleString;
        command.execute(message, client, models);
        return;
      }
    }
    else {
      // Unknown command
      return sendReplyMessage(message, channel, copyPasteGuideReply);
    }
  }

  if (!message.content.startsWith(prefix) || message.channel.name !== "commands") return;

  // Prefix command
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);
  if (command.role && !message.member.roles.cache.find(r => r.name === command.role)) return;
  if (command.args && !args.length) {
    return message.channel.send({ content: `You didn't provide any arguments, ${message.author}!`, reply: { messageReference: message.id } });
  }
  try {
    if (commandName === "update_database") {
      await command.execute(message, args, models);
    }
    else {
      await command.execute(message, args, models);
    }

    if (command.emit) await client.emit("COURSES_CHANGED", models);
    await message.react("✅");
  }
  catch (error) {
    logError(error);
    console.error(error);
    await message.react("❌");
  }
};

module.exports = {
  name: "messageCreate",
  execute,
};
