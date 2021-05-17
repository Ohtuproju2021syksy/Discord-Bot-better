const Discord = require('discord.js')
const { getRoleFromCategory, context } = require('./util')
const GUIDE_CHANNEL_NAME = "guide";

/**
 *
 * @param {Discord.Message} message
 */
const updateGuideMessage = async (message) => {
  const rows = message.guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      const count = message.guild.roles.cache.find(
        (role) => role.name === courseRole
      ).members.size;
      return `  - ${courseFullName} \`!join ${courseRole}\` 👤${count}`;
    }).sort((a, b) => a.localeCompare(b));

    const newContent = `
Käytössäsi on seuraavia komentoja:
  - \`!join\` jolla voit liittyä kurssille
  - \`!leave\` jolla voit poistua kurssilta
Esim: \`!join ohpe\`
  
You have the following commands available:
  - \`!join\` which you can use to join a course
  - \`!leave\` which you can use to leave a course
For example: \`!join ohpe\`

Kurssit / Courses:
${rows.join("\n")}

In course specific channels you can also list instructors \`!instructors\`

See more with \`!help\` and test out the commands in <#${context.commands.id}> channel!
`;

  message.edit(newContent);
};

/**
 *
 * @param {Discord.Guild} guild
 */
const updateGuide = async () => {
  const channel = context.guild.channels.cache.find(
    (c) => c.name === GUIDE_CHANNEL_NAME
  );
  const messages = await channel.messages.fetchPinned(true);
  const message = messages.first();
  updateGuideMessage(message);
};

module.exports = updateGuide