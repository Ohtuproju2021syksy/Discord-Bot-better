const {
  findOrCreateChannel,
  getChannelObject,
  findCategoryWithCourseName,
  getDefaultChannelObjects,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  setCoursePositionABC,
  createInvitation } = require("../discordBot/services/service");
const { findCourseFromDbById, updateGuide } = require("./services/courseService");
const { courseAdminRole } = require("../../config.json");

const initHooks = (guild, models) => {
  initChannelHooks(guild, models);
};

const initChannelHooks = (guild, { Channel, Course }) => {
  Channel.addHook("afterBulkDestroy", (channel) => {
    guild.channels.cache.find(c => c.name === channel.where.name)?.delete();
  });

  Channel.addHook("afterCreate", async (channel) => {
    const course = await findCourseFromDbById(channel.courseId, Course);
    const channelName = channel.name.replace(`${course.name}_`, "");

    if (!channel.defaultChannel) {
      const category = findCategoryWithCourseName(course.name, guild);
      const channelObject = getChannelObject(course.name, channelName, category);

      await findOrCreateChannel(channelObject, guild);
    }
  });

  Channel.addHook("afterBulkCreate", async (channel) => {
    const course = await findCourseFromDbById(channel[0].courseId, Course);

    const student = await findOrCreateRoleWithName(course.name, guild);
    const admin = await findOrCreateRoleWithName(`${course.name} ${courseAdminRole}`, guild);
    const categoryObject = getCategoryObject(course.name, getCategoryChannelPermissionOverwrites(guild, admin, student));
    const category = await findOrCreateChannel(categoryObject, guild);

    const channelObjects = await getDefaultChannelObjects(guild, course.name, student, admin, category);
    await Promise.all(channelObjects.map(
      async channelObject => await findOrCreateChannel(channelObject, guild),
    ));

    await setCoursePositionABC(guild, categoryObject.name);
    await createInvitation(guild, course.name);
    await guild.client.emit("COURSES_CHANGED", Course);
    await updateGuide(guild, Course);
  });
};

module.exports = { initHooks };