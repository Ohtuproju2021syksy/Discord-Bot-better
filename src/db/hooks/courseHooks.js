const {
  findOrCreateChannel,
  findCategoryWithCourseName,
  getDefaultChannelObjects,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  changeCourseRoles,
  updateAnnouncementChannelMessage,
  setEmojisLock,
  setEmojisUnlock,
  setEmojisHide,
  setEmojisUnhide,
  setCoursePositionABC,
  updateGuide } = require("../../discordBot/services/service");
const { lockTelegramCourse, unlockTelegramCourse } = require("../../bridge/service");
const { courseAdminRole } = require("../../../config.json");
const { Op } = require("sequelize");
const { editChannelNames, createDefaultChannelsToDatabase } = require("../../db/services/channelService");

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

  models.Course.addHook("afterCreate", async (course) => {
    const student = await findOrCreateRoleWithName(course.name, guild);
    const admin = await findOrCreateRoleWithName(`${course.name} ${courseAdminRole}`, guild);
    const categoryObject = getCategoryObject(course.name, getCategoryChannelPermissionOverwrites(guild, admin, student));
    const category = await findOrCreateChannel(categoryObject, guild);
    await course.update({ categoryId: category.id });

    const channelObjects = await getDefaultChannelObjects(guild, course.name, student, admin, category);
    const defaultChannelObjects = channelObjects.map(channelObject => {
      const voiceChannel = channelObject.options.type === "GUILD_VOICE";
      return {
        courseId: course.id,
        name: channelObject.name,
        defaultChannel: true,
        voiceChannel: voiceChannel,
      };
    });

    await createDefaultChannelsToDatabase(defaultChannelObjects, models.Channel);
  });

  models.Course.addHook("afterUpdate", async (course) => {
    if (!course._options.isNewRecord) {
      const changedValue = course._changed;
      const courseName = course.name;
      const previousCourseName = course._previousDataValues.name;
      let category = findCategoryWithCourseName(courseName, guild);
      const hidden = course.private;
      const locked = course.locked;

      if (changedValue.has("locked")) {
        if (locked) {
          await lockTelegramCourse(models.Course, courseName);
          await setEmojisLock(category, hidden, courseName, models);
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === course.name), { VIEW_CHANNEL: true, SEND_MESSAGES: false });
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "faculty"), { SEND_MESSAGES: true });
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "admin"), { SEND_MESSAGES: true });
        }
        else {
          await unlockTelegramCourse(models.Course, courseName);
          await setEmojisUnlock(category, hidden, courseName, models);
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === course.name), { VIEW_CHANNEL: true, SEND_MESSAGES: true });
        }
      }
      else if (changedValue.has("private")) {
        hidden ?
          await setEmojisHide(category, locked, courseName)
          : await setEmojisUnhide(category, locked, courseName);
      }
      else if (changedValue.has("name")) {
        category = findCategoryWithCourseName(previousCourseName, guild);
        const channelAnnouncement = guild.channels.cache.find(c => c.name === `${previousCourseName}_announcement`);
        const categoryEmojis = category.name.replace(previousCourseName, "").trim();
        await category.setName(`${categoryEmojis} ${courseName}`);
        await changeCourseRoles(previousCourseName, courseName, guild);
        await setCoursePositionABC(guild, `${categoryEmojis} ${courseName}`, models.Course);
        await editChannelNames(course.id, previousCourseName, courseName, models.Channel);
        await updateAnnouncementChannelMessage(guild, channelAnnouncement);
      }
      await updateGuide(guild, models);
    }
  });
};

module.exports = { initCourseHooks };