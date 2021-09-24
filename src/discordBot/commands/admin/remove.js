const { updateGuide, findCategoryName, removeCourseFromDb } = require("../../services/service");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (message, args, Course) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const courseName = args[0];

    const guild = message.guild;

    const courseString = findCategoryName(courseName, guild);
    const category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === courseString.toLowerCase());

    if (!category) return message.reply(`Error: Invalid course name: ${courseName}.`);
    await Promise.all(guild.channels.cache
      .filter(c => c.parent === category)
      .map(async channel => await channel.delete()),
    );

    await category.delete();

    await Promise.all(guild.roles.cache
      .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name.toLowerCase() === courseName.toLowerCase()))
      .map(async role => await role.delete()),
    );

    await removeCourseFromDb(courseName, Course);
    await updateGuide(guild, Course);
  }
};

module.exports = {
  prefix: true,
  name: "remove",
  description: "Delete course.",
  usage: "!remove [course name]",
  role: "admin",
  emit: true,
  execute,
};
