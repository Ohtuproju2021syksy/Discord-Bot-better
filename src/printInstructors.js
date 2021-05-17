const Discord = require("discord.js");
const { getRoleFromCategory } = require("./util");
/**
 *
 * @param {Discord.Message} msg
 */
const printInstructors = async (msg) => {
  const category = msg.channel.parent;
  const roleString = getRoleFromCategory(category.name);

  const courseAdminRole = msg.guild.roles.cache.find(role => role.name === `${roleString} admin`)
  if (!courseAdminRole) throw new Error(`Could not get admin role for ${roleString}`)

  const adminsString = courseAdminRole.members.map(user => user.nickname).join(', ')
  if (!adminsString) return msg.reply('It seems as if there are no instructors for this course yet. They need to be added manually.')

  msg.reply(`Here are the instructors for ${roleString}: ${adminsString}`);
};

module.exports = printInstructors;
