const { updateGuide, findCategoryWithCourseName, removeCourseFromDb, findCourseNickNameFromDbWithCourseCode } = require("../../services/service");
const { courseAdminRole } = require("../../../../config.json");
const { confirmChoiceNoInteraction } = require("../../services/message");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    let courseName = args.join(" ");
    const guild = message.guild;

    const confirm = await confirmChoiceNoInteraction(message, "Delete course: " + courseName, guild);
    if (!confirm) {
      return;
    }

    let category = findCategoryWithCourseName(courseName, guild);
    if (!category) {
      const courseNickName = await findCourseNickNameFromDbWithCourseCode(courseName, models.Course);
      if (courseNickName) {
        courseName = String(courseNickName.dataValues.name);
        category = findCategoryWithCourseName(courseName, guild);
      }
    }


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
  args: true,
  execute,
};
