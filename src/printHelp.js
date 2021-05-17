const Discord = require("discord.js");
/**
 * @param {Discord.Message} msg
 */
const printHelp = async (msg) => {
  msg.reply(`Here are the commands you can use:
  \`!join\` - joins you into the course given, e.g. \`!join ohpe\`
  \`!leave\` - remove you from the course, e.g. \`!leave ohpe\`
  \`!courses\` - prints out the courses to use with \`!join\` and \`!leave\`
  \`!instructors\` - prints out the instructors of the course. This command is available in most channels
  \`!help\` will print out this message
`);
};

module.exports = printHelp;
