const {
  findOrCreateChannel,
  getChannelObject,
  findCategoryWithCourseName,
  getDefaultChannelObjects,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  createInvitation,
  changeCourseRoles,
  updateAnnouncementChannelMessage,
  setEmojisLock,
  setEmojisUnlock,
  setEmojisHide,
  setEmojisUnhide,
  setCoursePositionABC,
  updateGuide,
  updateInviteLinks } = require("../discordBot/services/service");
const { lockTelegramCourse, unlockTelegramCourse } = require("../bridge/service");
const { findCourseFromDbById } = require("./services/courseService");
const { findUserByDbId } = require("./services/userService");
const { courseAdminRole, facultyRole } = require("../../config.json");
const { Op } = require("sequelize");
const { editChannelNames, createDefaultChannelsToDatabase } = require("../db/services/channelService");

const initHooks = (guild, models) => {
  initChannelHooks(guild, models);
  initCourseHooks(guild, models);
  initUserHooks(guild, models);
  initCourseMemberHooks(guild, models);
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
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase().includes(courseName.toLowerCase())), { VIEW_CHANNEL: true, SEND_MESSAGES: false });
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "faculty"), { SEND_MESSAGES: true });
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "admin"), { SEND_MESSAGES: true });
        }
        else {
          await unlockTelegramCourse(models.Course, courseName);
          await setEmojisUnlock(category, hidden, courseName, models);
          category.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase().includes(courseName.toLowerCase())), { VIEW_CHANNEL: true, SEND_MESSAGES: true });
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

const initUserHooks = (guild, models) => {
  models.User.addHook("afterUpdate", async (user) => {
    const changedValue = user._changed;
    const userDiscoId = user.discordId;

    if (changedValue.has("admin")) {
      const adminRole = guild.roles.cache.find(r => r.name === "admin");
      const userDisco = guild.members.cache.get(userDiscoId);
      user.admin
        ? userDisco.roles.add(adminRole)
        : userDisco.roles.remove(adminRole);
    }

    if (changedValue.has("faculty")) {
      const facultyRoleObject = guild.roles.cache.find(r => r.name === facultyRole);
      const userDisco = guild.members.cache.get(userDiscoId);
      user.faculty
        ? userDisco.roles.add(facultyRoleObject)
        : userDisco.roles.remove(facultyRoleObject);
    }
  });
};

const initCourseMemberHooks = (guild, models) => {
  models.CourseMember.addHook("afterCreate", async (courseMember) => {
    const user = await findUserByDbId(courseMember.userId, models.User);
    const course = await findCourseFromDbById(courseMember.courseId, models.Course);
    const member = guild.members.cache.get(user.discordId);
    const courseRole = guild.roles.cache.find(r => r.name === course.name);
    await member.roles.add(courseRole);
    await updateGuide(guild, models);
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

module.exports = { initHooks };