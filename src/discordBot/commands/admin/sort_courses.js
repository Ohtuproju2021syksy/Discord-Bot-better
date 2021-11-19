const { findAllCourseNames } = require("../../../db/services/courseService");
const { findCategoryWithCourseName } = require("../../services/service");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;

    let first = 9999;

    const categoryNames = await findAllCourseNames(models.Course);
    categoryNames.sort((a, b) => a.localeCompare(b));
    const categories = [];
    categoryNames.forEach(cat => {
      const guildCat = findCategoryWithCourseName(cat, guild);
      if (guildCat) {
        categories.push(guildCat);
        if (first > guildCat.position) first = guildCat.position;
      }
    });
    let category;

    for (let index = 0; index < categories.length; index++) {
      category = categories[index];
      await category.edit({ position: index + first });
    }
  }
};

module.exports = {
  prefix: true,
  name: "sort_courses",
  description: "Sort courses to alphabetical order.",
  role: "admin",
  usage: "!sort_courses",
  args: false,
  execute,
};
