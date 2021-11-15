const { createCourseMemberToDatabase } = require("../../../db/services/courseMemberService");
const { getCourseNameFromCategory } = require("../../services/service");
const { findCourseFromDb, isCourseCategory } = require("../../../db/services/courseService");
const { createChannelToDatabase } = require("../../../db/services/channelService");
const { createUserToDatabase } = require("../../../db/services/userService");
const { facultyRole } = require("../../../../config.json");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    await saveChannelsToDb(models, guild);
    await saveUsersToDb(models, guild);
    await saveCourseMembersToDb(models, guild);
  }
};

const saveChannelsToDb = async (models, guild) => {
  const channelCache = guild.channels.cache;
  const categoryChannels = [];
  for (const c in channelCache) {
    if (await isCourseCategory(c), models.Course) {
      categoryChannels.push(c);
    }
  }
  categoryChannels.map(c => c.id);
  const courseChannels = channelCache.filter(c => categoryChannels.includes(c.parentId));
  const channelsAsArray = Array.from(courseChannels.values());

  for (const channel in channelsAsArray) {
    const currentChannel = channelsAsArray[channel];
    const courseIdentifier = getCourseNameFromCategory(currentChannel.parent);
    const course = await findCourseFromDb(courseIdentifier, models.Course);
    if (course) {
      const defaultChannel = currentChannel.name
        .includes("_general") || currentChannel.name.includes("_announcement") || currentChannel.type === "GUILD_VOICE";
      const voiceChannel = currentChannel.type === "GUILD_VOICE";
      await createChannelToDatabase({
        courseId: course.id,
        name: currentChannel.name,
        defaultChannel: defaultChannel,
        voiceChannel: voiceChannel }, models.Channel);
    }
  }
};

const saveUsersToDb = async (models, guild) => {
  const memberCache = guild.members.cache;
  const members = memberCache.map(m => m.user).filter(u => !u.bot);

  const admins = guild.roles.cache
    .find(r => r.name === "admin")?.members
    .map(m => m.user.id);

  const faculty = guild.roles.cache
    .find(r => r.name === facultyRole)?.members
    .map(m => m.user.id);

  await Promise.all(members
    .map(async (m) => {
      const user = await createUserToDatabase(m.id, m.username, models.User);
      if (admins.includes(m.id)) user.admin = true;
      if (faculty.includes(m.id)) user.faculty = true;
      user.save();
    }));
};

const saveCourseMembersToDb = async (models, guild) => {
  const courses = [];
  const channels = guild.channels.cache;
  for (const c in channels) {
    if (await isCourseCategory(c), models.Course) {
      courses.push(c);
    }
  }


  for (const course in courses) {
    const courseIdentifier = getCourseNameFromCategory(courses[course].name);
    const courseMembers = guild.roles.cache.find(
      (role) => role.name === courseIdentifier,
    )?.members.map((m) => m.user);

    const courseInstructors = guild.roles.cache.find(
      (role) => role.name === `${courseIdentifier} ${courseAdminRole}`,
    )?.members.map((m) => m.user.id);

    for (const courseMember in courseMembers) {
      const user = courseMembers[courseMember];
      const userFromDb = await createUserToDatabase(user.id, user.username, models.User);
      const courseFromDb = await findCourseFromDb(courseIdentifier, models.Course);
      const courseMemberInstance = await createCourseMemberToDatabase(userFromDb.id, courseFromDb.id, models.CourseMember);

      if (courseInstructors.includes(user.id)) {
        courseMemberInstance.instructor = true;
        courseMemberInstance.save();
      }
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