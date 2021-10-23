const { updateGuide, findCategoryName, removeCourseFromDb, findCourseNickNameFromDbWithCourseCode } = require("../../services/service");
const { courseAdminRole } = require("../../../../config.json");
const { confirmChoiceNoInteraction } = require("../../services/message");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    let courseName = args.join(" ");
    const guild = message.guild;

    let courseString = findCategoryName(courseName, guild);
    let category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === courseString.toLowerCase());
    if (!category) {
      const courseNickName = await findCourseNickNameFromDbWithCourseCode(courseName, models.Course);
      if (courseNickName) {
        courseName = String(courseNickName.dataValues.name);
        courseString = findCategoryName(courseName, guild);
        category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === courseString.toLowerCase());
      }
    }


    if (!category) return message.reply(`Error: Invalid course name: ${courseName}.`);

    const confirm = await confirmChoiceNoInteraction(message, "Delete course: " + courseName, guild);

    if (!confirm) {
      return;
    }

    await Promise.all(guild.channels.cache
      .filter(c => c.parent === category)
      .map(async channel => await channel.delete()),
    );

    await category.delete();

    await Promise.all(guild.roles.cache
      .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name.toLowerCase() === courseName.toLowerCase()))
      .map(async role => await role.delete()),
    );

    await removeCourseFromDb(courseName, models.Course);
    await updateGuide(guild, models.Course);
  }
};

module.exports = {
  prefix: true,
  name: "delete_course",
  description: "Delete course.",
  usage: "!delete_course [course name]",
  role: "admin",
  emit: true,
  execute,
};
