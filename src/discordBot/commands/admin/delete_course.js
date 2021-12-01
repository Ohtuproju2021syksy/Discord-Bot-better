const { removeCourseFromDb, findCourseFromDb } = require("../../../db/services/courseService");
const { confirmChoiceNoInteraction } = require("../../services/confirm");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const courseName = args.join(" ");
    const guild = message.guild;

    const confirm = await confirmChoiceNoInteraction(message, "Delete course: " + courseName, guild);
    if (!confirm) {
      return;
    }

    const course = await findCourseFromDb(courseName, models.Course);
    if (!course) return message.reply(`Error: Invalid course name: ${courseName}.`);

    await removeCourseFromDb(courseName, models.Course);
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
