const {
  updateAnnouncementChannelMessage,
  updateGuide,
  updateInviteLinks } = require("../../discordBot/services/service");
const { findCourseFromDbById } = require("../services/courseService");
const { findUserByDbId } = require("../services/userService");
const { courseAdminRole } = require("../../../config.json");
const { joinedUsersCounter } = require("../../promMetrics/promCounters");
const { logInfo } = require("../../discordBot/services/logger");

const initCourseMemberHooks = (guild, models) => {
  models.CourseMember.addHook("afterCreate", async (courseMember) => {
    logInfo("courseMember : " + JSON.stringify(courseMember));
    const user = await findUserByDbId(courseMember.dataValues.userId, models.User);
    logInfo("User: " + JSON.stringify(user));
    const course = await findCourseFromDbById(courseMember.dataValues.courseId, models.Course);
    const member = guild.members.cache.get(user.dataValues.discordId);
    logInfo("Member: " + member);
    const courseRole = guild.roles.cache.find(r => r.name === course.name);
    await member.roles.add(courseRole);
    await updateGuide(guild, models);
    joinedUsersCounter.inc({ course: course.name });
  });

  models.CourseMember.addHook("afterBulkDestroy", async (courseMember) => {
    const user = await findUserByDbId(courseMember.where.userId, models.User);
    const course = await findCourseFromDbById(courseMember.where.courseId, models.Course);
    const member = guild.members.cache.get(user.discordId);
    const courseRoles = guild.roles.cache
      .filter(role => (role.name === `${course.name} ${courseAdminRole}` || role.name === course.name))
      .map(role => role.name);

    await Promise.all(member.roles.cache
      .filter(role => courseRoles.includes(role.name))
      .map(async role => await member.roles.remove(role)));
    await member.fetch(true);
    const announcementChannel = guild.channels.cache.find(c => c.name === `${course.name}_announcement`);
    await updateAnnouncementChannelMessage(guild, announcementChannel);
    await updateGuide(guild, models);
  });

  models.CourseMember.addHook("afterUpdate", async (courseMember) => {
    if (courseMember._changed.has("instructor")) {
      await updateInviteLinks(guild);
    }
  });
};

module.exports = { initCourseMemberHooks };