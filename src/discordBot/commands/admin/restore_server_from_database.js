const { getAllCourses, saveCourseIdWithName, findCourseFromDbById, getCourseByDiscordId } = require("../../../db/services/courseService");
const { getAllChannels, saveChannelIdWithName, getChannelByDiscordId } = require("../../../db/services/channelService");
const { getAllUsers, findUserByDbId } = require("../../../db/services/userService");
const { getAllMembers } = require("../../../db/services/courseMemberService");
const { confirmChoiceNoInteraction } = require("../../services/confirm");
const {
  findOrCreateChannel,
  findOrCreateRoleWithName,
  getCategoryObject,
  getCategoryChannelPermissionOverwrites,
  createInvitation,
  updateAnnouncementChannelMessage,
  updateGuide,
  setCoursePositionABC } = require("../../services/service");
const { courseAdminRole, facultyRole } = require("../../../../config.json");
const { logError } = require("../../services/logger");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const confirm = await confirmChoiceNoInteraction(message, "Restore EVERYTHING from database?", guild);
    if (!confirm) {
      return;
    }
    const confirm2 = await confirmChoiceNoInteraction(message, "Are you ABSOLUTELY sure?", guild);
    if (!confirm2) {
      return;
    }
    await restoreCategories(guild, models);
    await restoreChannels(guild, models);
    await restorePermissions(guild, models);
    await restoreUsers(guild, models);
    await restoreCourseMembers(guild, models);
    await deleteExtraChannels(guild, models);

    await updateGuide(guild, models);
  }
};

const restoreCategories = async (guild, models) => {
  const channelCache = guild.channels.cache;
  const allCourses = await getAllCourses(models.Course);

  for (const course in allCourses) {
    const currentCourse = allCourses[course];
    const student = await findOrCreateRoleWithName(currentCourse.name, guild);
    const admin = await findOrCreateRoleWithName(`${currentCourse.name} ${courseAdminRole}`, guild);
    const categoryFound = await channelCache.get(currentCourse.categoryId);

    if (categoryFound) {
      emojiName(currentCourse, currentCourse);
      await categoryFound.setName(currentCourse.name);
      await setCoursePositionABC(guild, currentCourse.name, models.Course);
    }
    else {

      let categoryObject = getCategoryObject(currentCourse.name, getCategoryChannelPermissionOverwrites(guild, admin, student));
      categoryObject = emojiName(categoryObject, currentCourse);
      const category = await findOrCreateChannel(categoryObject, guild);
      await saveCourseIdWithName(category.id, currentCourse.name, models.Course);

      await setCoursePositionABC(guild, categoryObject.name, models.Course);
    }
  }
};

const restoreChannels = async (guild, models) => {
  const channelCache = guild.channels.cache;
  const allChannels = await getAllChannels(models.Channel);

  for (const channel in allChannels) {
    const currentChannel = allChannels[channel];
    const channelFound = await channelCache.get(currentChannel.discordId);

    if (channelFound) {
      channelFound.name = currentChannel.name;
      const parentChannel = await findCourseFromDbById(currentChannel.courseId, models.Course);
      await channelFound.setParent(parentChannel.categoryId);

    }
    else {
      const parentId = await findCourseFromDbById(currentChannel.courseId, models.Course);
      const parentChannel = await channelCache.get(parentId.dataValues.categoryId);
      const student = await findOrCreateRoleWithName(parentId.name, guild);
      const admin = await findOrCreateRoleWithName(`${parentId.name} ${courseAdminRole}`, guild);

      if (!currentChannel.voiceChannel) {
        let channelObject;
        if (currentChannel.name.includes("_announcement")) {
          channelObject = {
            name: currentChannel.name,
            parent: parentChannel,
            options: { type: "GUILD_TEXT", parent: parentChannel, permissionOverwrites: [
              {
                id: guild.id,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: student,
                deny: ["SEND_MESSAGES"],
                allow: ["VIEW_CHANNEL"],
              },
              {
                id: admin,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
              },
            ], topic: currentChannel.topic },
          };
        }
        else {
          channelObject = {
            name: currentChannel.name,
            parent: parentChannel,
            options: { type: "GUILD_TEXT", parent: parentChannel, permissionOverwrites: [], topic: currentChannel.topic },
          };
        }

        const newChannel = await findOrCreateChannel(channelObject, guild);
        await saveChannelIdWithName(newChannel.id, currentChannel.name, models.Channel);

        if (newChannel.name.includes("_announcement")) {
          await createInvitation(guild, parentId.dataValues.name);
          await updateAnnouncementChannelMessage(guild, newChannel);
        }

      }
      else if (currentChannel.voiceChannel) {

        const channelObject = {
          name: currentChannel.name,
          parent: parentChannel,
          options: { type: "GUILD_VOICE", parent: parentChannel, permissionOverwrites: [], topic: currentChannel.topic },
        };

        const newChannel = await findOrCreateChannel(channelObject, guild);
        await saveChannelIdWithName(newChannel.id, currentChannel.name, models.Channel);

      }
    }
  }
};

const restorePermissions = async (guild, models) => {
  const channelCache = guild.channels.cache;
  const allCourses = await getAllCourses(models.Course);

  for (const course in allCourses) {
    const currentCourse = allCourses[course];
    const discordCategory = await channelCache.get(currentCourse.categoryId);
    if (currentCourse.locked) {
      discordCategory.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase() === `${currentCourse.name}`), { VIEW_CHANNEL: true, SEND_MESSAGES: false });
      discordCategory.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase() === `${currentCourse.name} ${courseAdminRole}`), { VIEW_CHANNEL: true, SEND_MESSAGES: true });
      discordCategory.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "faculty"), { SEND_MESSAGES: true });
      discordCategory.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "admin"), { SEND_MESSAGES: true });
    }
    else {
      try {
        discordCategory.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase() === `${currentCourse.name}`), { VIEW_CHANNEL: true, SEND_MESSAGES: true });
      }
      catch (error) {
        logError(currentCourse + " " + guild.roles.cache.find(r => r.name.toLowerCase() === `${currentCourse.name}`));
      }
    }
  }
};

const restoreUsers = async (guild, models) => {
  const users = await getAllUsers(models.User);
  const adminRoleObject = await guild.roles.cache.find(r => r.name === "admin");
  const facultyRoleObject = await guild.roles.cache.find(r => r.name === facultyRole);

  for (const user in users) {
    const currentUser = users[user];
    const foundUser = await guild.members.cache.get(currentUser.discordId);
    if (foundUser) {
      await foundUser.roles.remove(foundUser.roles.cache);
      if (currentUser.admin) {
        await foundUser.roles.add(adminRoleObject);
      }
      if (currentUser.faculty) {
        await foundUser.roles.add(facultyRoleObject);
      }
    }
  }
};

const restoreCourseMembers = async (guild, models) => {
  const members = await getAllMembers(models.CourseMember);
  for (const member in members) {
    const currentMember = members[member];
    const user = await findUserByDbId(currentMember.userId, models.User);
    const course = await findCourseFromDbById(currentMember.courseId, models.Course);
    const instructor = currentMember.instructor;
    if (user) {
      const foundUser = await guild.members.cache.get(user.discordId);
      if (foundUser) {
        const courseRole = guild.roles.cache.find(r => r.name === course.name);
        await foundUser.roles.add(courseRole);
        if (instructor) {
          const instructorRole = guild.roles.cache.find(r => r.name === `${course.name} ${courseAdminRole}`);
          await foundUser.roles.add(instructorRole);
        }
      }
    }
  }
};

const deleteExtraChannels = async (guild, models) => {
  await Promise.all(guild.channels.cache.map(async aChannel => {
    if (aChannel.type !== "GUILD_CATEGORY") {
      const channelToRemove = await getChannelByDiscordId(aChannel.id, models.Channel);
      if (!channelToRemove) {
        if (aChannel.parent) {
          const parentId = aChannel.parent.id;
          const parent = await getCourseByDiscordId(parentId, models.Course);
          if (parent) {
            aChannel.delete();
          }
        }
      }
    }
  }));
};

const emojiName = (categoryObject, currentCourse) => {
  if (!currentCourse.locked && !currentCourse.private) {
    categoryObject.name = "📚 " + currentCourse.name;
  }
  else if (!currentCourse.locked && currentCourse.private) {
    categoryObject.name = "👻 " + currentCourse.name;
  }
  else if (currentCourse.locked && !currentCourse.private) {
    categoryObject.name = "📚🔐 " + currentCourse.name;
  }
  else if (currentCourse.locked && currentCourse.private) {
    categoryObject.name = "👻🔐 " + currentCourse.name;
  }
  return categoryObject;
};


module.exports = {
  prefix: true,
  name: "restore_server_from_database",
  description: "Recreate Discord server from database",
  role: "admin",
  usage: "!restore_server_from_database",
  args: false,
  execute,
};