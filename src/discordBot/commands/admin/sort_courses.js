const { findAllCoursesFromDb } = require("../../../db/services/courseService");
const { findChannelWithNameAndType } = require("../../services/service");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;

    let first = 9999;

    const result = await findAllCoursesFromDb(models.Course);
    result.sort((a, b) => a.name.localeCompare(b.name));
    result.map((c) => {
      const channel = findChannelWithNameAndType(c.name, "GUILD_CATEGORY", guild);
      if (first > channel.position) first = channel.position;
      return channel.name;
    });

    let category;

    for (let index = 0; index < result.length; index++) {
      const courseString = result[index].name;
      category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.includes(courseString));
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
