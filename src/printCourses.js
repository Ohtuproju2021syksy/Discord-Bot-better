const Discord = require("discord.js");
const { getRoleFromCategory, context } = require("./util");
/**
 *
 * @param {Discord.Message} msg
 */
const printCourses = async (msg) => {
  const { guild } = context;
  const rows = guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      return `${courseFullName} - \`!join ${courseRole}\``;
    })
    .sort((a, b) => a.localeCompare(b));

  msg.reply('\n'+ rows.join("\n"))
};

module.exports = printCourses;
