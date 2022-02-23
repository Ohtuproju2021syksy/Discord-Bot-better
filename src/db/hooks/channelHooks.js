const {
  findOrCreateChannel,
  getChannelObject,
  findCategoryWithCourseName,
  getDefaultChannelObjects,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  createInvitation,
  setCoursePositionABC,
  updateGuide } = require("../../discordBot/services/service");
const { findCourseFromDbById } = require("../services/courseService");
const { courseAdminRole } = require("../../../config.json");
const { Op } = require("sequelize");

const initChannelHooks = (guild, models) => {
  const channelModel = models.Channel;
  const courseModel = models.Course;
  channelModel.addHook("afterBulkDestroy", (channel) => {
    guild.channels.cache.find(c => c.name === channel.where.name[Op.iLike])?.delete();
  });

  channelModel.addHook("afterCreate", async (channel) => {
    const course = await findCourseFromDbById(channel.courseId, courseModel);
    const channelName = channel.name.replace(`${course.name}_`, "");

    if (!channel.defaultChannel) {
      const category = findCategoryWithCourseName(course.name, guild);
      const channelObject = getChannelObject(course.name, channelName, category);

      const createdChannel = await findOrCreateChannel(channelObject, guild);
      await channel.update({ discordId: createdChannel.id });
    }
  });

  channelModel.addHook("afterBulkCreate", async (channel) => {
    const course = await findCourseFromDbById(channel[0].courseId, courseModel);

    const student = await findOrCreateRoleWithName(course.name, guild);
    const admin = await findOrCreateRoleWithName(`${course.name} ${courseAdminRole}`, guild);
    const categoryObject = getCategoryObject(course.name, getCategoryChannelPermissionOverwrites(guild, admin, student));
    const category = await findOrCreateChannel(categoryObject, guild);

    const channelObjects = await getDefaultChannelObjects(guild, course.name, student, admin, category);
    await Promise.all(channelObjects.map(async channelObject => {
      const createdChannel = await findOrCreateChannel(channelObject, guild);
      const channelInstance = channel.find(c => c.name === createdChannel.name);
      await channelInstance.update({ discordId: createdChannel.id });
    }));

    await setCoursePositionABC(guild, categoryObject.name, courseModel);
    await createInvitation(guild, course.name);
    await guild.client.emit("COURSES_CHANGED", courseModel);
    await updateGuide(guild, models);
  });

  channelModel.addHook("afterUpdate", async (channel) => {
    if (channel._changed.has("name") && channel._previousDataValues.name) {
      const channelObject = guild.channels.cache
        .find(c => c.name === channel._previousDataValues.name);
      await channelObject.setName(channel.name);
    }

    if (channel._changed.has("topic")) {
      const channelObject = guild.channels.cache.find(c => c.name === channel.name);
      await channelObject.setTopic(channel.topic);
    }

    if (channel._changed.has("hidden")) {
      const course = await findCourseFromDbById(channel.courseId, courseModel);
      const student = await findOrCreateRoleWithName(course.name, guild);
      const channelObject = guild.channels.cache
        .find(c => c.name === channel.dataValues.name);
      if (channel.hidden) {
        await channelObject.permissionOverwrites.create(student, {
          VIEW_CHANNEL: false,
          SEND_MESSAGES: false,
        });
      }
      else {
        await channelObject.permissionOverwrites.create(student, {
          VIEW_CHANNEL: true,
          SEND_MESSAGES: true,
        });
      }
    }
  });
};

module.exports = { initChannelHooks };