const { createCourseMemberToDatabase } = require("../../../db/services/courseMemberService");
const { getCourseNameFromCategory } = require("../../services/service");
const { findCourseFromDb, isCourseCategory } = require("../../../db/services/courseService");
const { createChannelToDatabase } = require("../../../db/services/channelService");
const { createUserToDatabase } = require("../../../db/services/userService");
const { facultyRole } = require("../../../../config.json");

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

  await Promise.all(channelCache.map(async (c) => {
    if (await isCourseCategory(c, models.Course)) {
      categoryChannels.push(c.id);
    }
  }));

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
  const members = await guild.members.fetch();
  const roles = await guild.roles.fetch();
  const notBots = members.map(m => m.user).filter(u => !u.bot);

  const admins = roles
    .find(r => r.name === "admin")?.members
    .map(m => m.user.id);

  const faculty = roles
    .find(r => r.name === facultyRole)?.members
    .map(m => m.user.id);

  await Promise.all(notBots
    .map(async (m) => {
      const user = await createUserToDatabase(m.id, m.username, models.User);
      user.admin = admins.includes(m.id);
      user.faculty = faculty.includes(m.id);
      user.save();
    }));
};

const saveCourseMembersToDb = async (models, guild) => {
  const members = await guild.members.fetch();
  const notBots = members.filter(u => !u.user.bot);
  const channels = await guild.channels.fetch();
  const roles = await guild.roles.fetch();

  const courses = [];
  await Promise.all(channels.map(async (c) => {
    if (await isCourseCategory(c, models.Course)) {
      courses.push(getCourseNameFromCategory(c.name));
    }
  }));

  const instructorRoles = roles.filter(r => r.name.includes("instructor"));
  const instructorRoleIds = instructorRoles.map(r => r.id);
  const courseRoles = roles.filter(r => courses.includes(r.name));
  const courseRoleIds = courseRoles.map(r => r.id);

  await Promise.all(notBots.map(async (m) => {
    const coursesJoined = m._roles
      .filter(r => courseRoleIds.includes(r))
      .map(id => courseRoles.get(id).name);
    const instructorIn = m._roles
      .filter(r => instructorRoleIds.includes(r))
      .map(id => instructorRoles.get(id).name.replace(" instructor", ""));

    const user = m.user;
    const userFromDb = await createUserToDatabase(user.id, user.username, models.User);

    for (const course in coursesJoined) {
      const courseFromDb = await findCourseFromDb(coursesJoined[course], models.Course);
      const courseMemberInstance = await createCourseMemberToDatabase(userFromDb.id, courseFromDb.id, models.CourseMember);

      courseMemberInstance.instructor = instructorIn.includes(coursesJoined[course]);
      await courseMemberInstance.save();
    }
  }));
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