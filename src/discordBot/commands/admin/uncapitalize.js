const { uncapitalize } = require("../../../db/services/channelService");
const { getCourseByDiscordId } = require("../../../db/services/courseService");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const categoryId = args[0];
    console.log(categoryId);
    const courseId = await getCourseByDiscordId(categoryId, models.Course);
    await uncapitalize(courseId.id, models.Channel);

  }
};

module.exports = {
  prefix: true,
  name: "uncapitalize",
  description: "uncapitalize.",
  role: "admin",
  usage: "!uncapitalize [category's Discord id]",
  args: true,
  execute,
};