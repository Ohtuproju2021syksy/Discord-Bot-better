const { initCourseMemberHooks } = require("./hooks/courseMemberHooks");
const { initCourseHooks } = require("./hooks/courseHooks");
const { initChannelHooks } = require("./hooks/channelHooks");
const { initUserHooks } = require("./hooks/userHooks");

const initHooks = (guild, models) => {
  initChannelHooks(guild, models);
  initCourseHooks(guild, models);
  initUserHooks(guild, models);
  initCourseMemberHooks(guild, models);
};

module.exports = { initHooks };