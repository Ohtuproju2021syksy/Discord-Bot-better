const {
  findOrCreateChannel,
  getChannelObject,
  findCategoryWithCourseName,
  getDefaultChannelObjects,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  createInvitation } = require("../discordBot/services/service");
const { findCourseFromDbById, updateGuide, setCoursePositionABC } = require("./services/courseService");
const { courseAdminRole } = require("../../config.json");
const { Op } = require("sequelize");

const initHooks = (guild, models) => {
  initChannelHooks(guild, models);
  initCourseHooks(guild, models);
};

const initChannelHooks = (guild, models) => {
  const channelModel = models.Channel;
  const courseModel = models.Course;
  channelModel.addHook("afterBulkDestroy", (channel) => {
    guild.channels.cache.find(c => c.name === channel.where.name)?.delete();
  });

  channelModel.addHook("afterCreate", async (channel) => {
    const course = await findCourseFromDbById(channel.courseId, courseModel);
    const channelName = channel.name.replace(`${course.name}_`, "");

    if (!channel.defaultChannel) {
      const category = findCategoryWithCourseName(course.name, guild);
      const channelObject = getChannelObject(course.name, channelName, category);

      await findOrCreateChannel(channelObject, guild);
    }
  });

  channelModel.addHook("afterBulkCreate", async (channel) => {
    const course = await findCourseFromDbById(channel[0].courseId, courseModel);

    const student = await findOrCreateRoleWithName(course.name, guild);
    const admin = await findOrCreateRoleWithName(`${course.name} ${courseAdminRole}`, guild);
    const categoryObject = getCategoryObject(course.name, getCategoryChannelPermissionOverwrites(guild, admin, student));
    const category = await findOrCreateChannel(categoryObject, guild);

    const channelObjects = await getDefaultChannelObjects(guild, course.name, student, admin, category);
    await Promise.all(channelObjects.map(
      async channelObject => await findOrCreateChannel(channelObject, guild),
    ));

    await setCoursePositionABC(guild, categoryObject.name, courseModel);
    await createInvitation(guild, course.name);
    await guild.client.emit("COURSES_CHANGED", courseModel);
    await updateGuide(guild, models);
  });
};

const initCourseHooks = (guild, models) => {
  models.Course.addHook("afterBulkDestroy", async (course) => {
    const courseName = course.where.name[Op.iLike];
    const category = findCategoryWithCourseName(courseName, guild);

    await Promise.all(guild.channels.cache
      .filter(c => c.parent === category)
      .map(async channel => await channel.delete()),
    );

    await category?.delete();

    await Promise.all(guild.roles.cache
      .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name.toLowerCase() === courseName.toLowerCase()))
      .map(async role => await role.delete()),
    );

    await updateGuide(guild, models);
  });
};

module.exports = { initHooks };