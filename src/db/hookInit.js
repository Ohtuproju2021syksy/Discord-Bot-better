const {
  findOrCreateChannel,
  getChannelObject,
  findCategoryWithCourseName,
  getDefaultChannelObjects,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  createInvitation,
  co } = require("../discordBot/services/service");
const { findCourseFromDbById, updateGuide, setCoursePositionABC, setCourseToLocked, setCourseToUnlocked } = require("./services/courseService");
const { lockTelegramCourse, unlockTelegramCourse } = require("../bridge/service");
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

  channelModel.addHook("afterUpdate", async (channel) => {
    console.log("CHANNEL CHANGED");
    console.log(channel);
    console.log(channel._previousDataValues);
    // console.log("PARENT: ", channel.parent);

    if (channel._changed.has("name")) {
      const previousCourseName = channel._previousDataValues.name.split("_")[0];
      const trimmedCourseName = channel.name.split("_")[0];

      await Promise.all(guild.channels.cache
        .filter(c => c.name === channel._previousDataValues.name)
        .map(async ch => {
          let newName;
          if (ch.name.includes(previousCourseName)) {
            newName = ch.name.replace(previousCourseName, trimmedCourseName);
          }
          else {
            newName = ch.name.replace(previousCourseName.toLowerCase(), trimmedCourseName);
          }
          await ch.setName(newName);
        },
        ));
    }
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

  models.Course.addHook("afterUpdate", async (course) => {
    console.log(course._previousDataValues);
    console.log(course._changed);
    const changedValue = course._changed;
    const courseName = course.name;
    console.log(courseName);
    let category = findCategoryWithCourseName(courseName, guild);
    console.log(category);

    if (changedValue.has("locked")) {
      console.log("LOCK CHANGED");
      if (course._previousDataValues.locked) {
        if (course._previousDataValues.private) {
          await category.setName(`👻 ${courseName}`);
        }
        else {
          await category.setName(`📚 ${courseName}`);
        }
        await unlockTelegramCourse(models.Course, courseName);
      }
      else {
        if (course._previousDataValues.private) {
          await category.setName(`👻🔐 ${courseName}`);
        }
        else {
          await category.setName(`📚🔐 ${courseName}`);
        }
        await lockTelegramCourse(models.Course, courseName);
      }
    }
    else if (changedValue.has("private")) {
      console.log("PRIVATE CHANGED");
      if (course._previousDataValues.private) {
        if (course._previousDataValues.locked) {
          await category.setName(`📚🔐 ${courseName}`);
        }
        else {
          await category.setName(`📚 ${courseName}`);
        }
      }
      else if (course._previousDataValues.locked) {
        await category.setName(`👻🔐 ${courseName}`);
      }
      else {
        await category.setName(`👻 ${courseName}`);
      }
    }
    else if (changedValue.has("code")) {
      console.log("CODE CHANGED");
    }
    else if (changedValue.has("fullName")) {
      console.log("FULLNAME CHANGED");
    }
    else if (changedValue.has("name")) {
      console.log("NAME CHANGED");
      // const channelAnnouncement = guild.channels.cache.find(c => c.name === `${courseName}_announcement`);
      const previousCourseName = course._previousDataValues.name;
      category = findCategoryWithCourseName(previousCourseName, guild);
      const categoryEmojis = category.name.replace(previousCourseName, "").trim();
      await category.setName(`${categoryEmojis} ${courseName}`);
    }

    await updateGuide(guild, models);
  });
};

module.exports = { initHooks };