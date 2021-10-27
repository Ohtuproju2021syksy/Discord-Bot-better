const { createCourseMemberToDatabase } = require("../../../db/services/courseMemberService");
const { trimCourseName, isCourseCategory } = require("../../services/service");
const { findCourseFromDb } = require("../../../db/services/courseService");
const { createChannelToDatabase } = require("../../../db/services/channelService");
const { createUserToDatabase } = require("../../../db/services/userService");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    saveChannelsToDb(models, guild);
    saveUsersToDb(models, guild);
  }
};

const saveChannelsToDb = async (models, guild) => {
  const channelCache = guild.channels.cache;
  const courseTextChannels = channelCache.filter(c => c.type === "GUILD_TEXT" && c.name !== "general" && c.parentId != null);
  const channelsToSave = courseTextChannels.filter(c => !c.name.includes("_announcement") && !c.name.includes("_general"));
  const channelsAsArray = Array.from(channelsToSave.values());

  for (const channel in channelsAsArray) {
    const currentChannel = channelsAsArray[channel];
    const courseIdentifier = trimCourseName(currentChannel.parent);
    const course = await findCourseFromDb(courseIdentifier, models.Course);
    if (course) {
      await createChannelToDatabase(course.id, currentChannel.name, models.Channel);
    }
  }
};

const saveUsersToDb = async (models, guild) => {
  const courses = guild.channels.cache
    .filter(c => c.type === "GUILD_CATEGORY" && isCourseCategory(c))
    .map((c) => c);

  for (const course in courses) {
    const courseIdentifier = trimCourseName(courses[course].name);
    const courseMembers = guild.roles.cache.find(
      (role) => role.name === courseIdentifier,
    )?.members.map((m) => m.user);

    for (const courseMember in courseMembers) {
      const user = courseMembers[courseMember];
      const userFromDb = await createUserToDatabase(user.id, user.username, models.User);
      const courseFromDb = await findCourseFromDb(courseIdentifier, models.Course);
      await createCourseMemberToDatabase(userFromDb.id, courseFromDb.id, models.CourseMember);
    }
  }
};

module.exports = {
  prefix: true,
  name: "update_database",
  description: "Save existing channels to database.",
  role: "admin",
  usage: "!update_database",
  args: false,
  execute,
};