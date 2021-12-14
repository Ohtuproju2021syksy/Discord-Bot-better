const { getAllCourses, findCourseFromDbById, getCourseByDiscordId } = require("../../../db/services/courseService");
const { getChannelByDiscordId, findChannelsByCourse } = require("../../../db/services/channelService");
const { getAllUsers, findUserByDbId } = require("../../../db/services/userService");
const { getAllMembers } = require("../../../db/services/courseMemberService");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const channelCache = guild.channels.cache;

    if (!guild.roles.cache.find(r => r.name === "faculty")) {
      message.reply("Faculty role is missing from server");
    }

    const allCourses = await getAllCourses(models.Course);
    for (const course in allCourses) {
      const currentCourse = allCourses[course];
      const locked = currentCourse.locked;
      let statusMessage = "";
      const courseRole = guild.roles.cache.find(r => r.name === `${currentCourse.name}`);
      const courseInstructorRole = guild.roles.cache.find(r => r.name === `${currentCourse.name} ${courseAdminRole}`);

      if (!courseRole) {
        statusMessage += "Course role is missing\n";
      }
      if (!courseInstructorRole) {
        statusMessage += "Course instructor role is missing\n";
      }

      const categoryFound = await channelCache.get(currentCourse.categoryId);

      if (!categoryFound) {
        statusMessage += "Course category is missing\n";
      }
      else {
        const emojiCourseName = emojiName(currentCourse);

        if (categoryFound.name !== emojiCourseName) {
          statusMessage += "Course category name is wrong\n";
        }
        if (courseRole && courseInstructorRole) {
          if (locked) {
            if (courseRole.permissionsIn(categoryFound).has("SEND_MESSAGES")) {
              statusMessage += "Course members can speak in locked course\n";
            }
          }
          else if (!courseRole.permissionsIn(categoryFound).has("SEND_MESSAGES")) {
            statusMessage += "Course members can't talk in unlocked course\n";
          }
        }
        else {
          statusMessage += "Can't check permissions because role(s) are missing\n";
        }

      }

      const courseChannels = await findChannelsByCourse(currentCourse.id, models.Channel);

      for (const channel in courseChannels) {
        const currentChannel = courseChannels[channel];
        const channelFound = await channelCache.get(currentChannel.discordId);
        if (!channelFound) {
          statusMessage += "Channel: " + currentChannel.name + " missing\n";
        }
        else {
          if (channelFound.name !== currentChannel.name) {
            statusMessage += "Channel: " + currentChannel.name + " wrong name\n";
          }
          if (!channelFound.parent || channelFound.parent.id !== currentCourse.categoryId) {
            statusMessage += "Channel: " + currentChannel.name + " placed in wrong category\n";
          }
          if (locked && !currentChannel.name.includes("announcement")) {
            if (courseRole.permissionsIn(channelFound).has("SEND_MESSAGES")) {
              statusMessage += "Channel: " + currentChannel.name + " Course members can speak in locked channel\n";
            }
          }
          else if (!courseRole.permissionsIn(channelFound).has("SEND_MESSAGES") && !currentChannel.name.includes("announcement")) {
            statusMessage += "Channel: " + currentChannel.name + " Course members can't talk in unlocked channel\n";
          }
        }
      }
      if (statusMessage === "") {
        statusMessage = "Course has correct name, permissions are right and its channels are correct";
      }
      message.reply("**" + currentCourse.fullName + "** status:\n" + statusMessage);
    }

    const allUsers = await getAllUsers(models.User);
    const adminRoleObject = await guild.roles.cache.find(r => r.name === "admin");
    const facultyRoleObject = await guild.roles.cache.find(r => r.name === facultyRole);

    let statusMessage = "";
    for (const user in allUsers) {
      const currentUser = allUsers[user];
      const foundUser = await guild.members.cache.get(currentUser.discordId);

      if (foundUser) {
        if (currentUser.admin) {
          if (!foundUser.roles.cache.some(r => r.id === adminRoleObject.id)) {
            statusMessage += foundUser.nickname + ": missing admin role\n";
          }
        }
        if (currentUser.faculty) {
          if (!foundUser.roles.cache.some(r => r.id === facultyRoleObject.id)) {
            statusMessage += foundUser.nickname + ": missing faculty role\n";
          }
        }
      }
    }
    if (statusMessage === "") {
      statusMessage = "All admins/faculty has their roles";
    }
    message.reply("Admin/Faculty roles:\n" + statusMessage);
    statusMessage = "";
    const allCourseMembers = await getAllMembers(models.CourseMember);

    for (const member in allCourseMembers) {
      const currentMember = allCourseMembers[member];
      const user = await findUserByDbId(currentMember.userId, models.User);
      const foundUser = await guild.members.cache.get(user.discordId);
      const course = await findCourseFromDbById(currentMember.courseId, models.Course);
      const instructorRoleObject = await guild.roles.cache.find(r => r.name === `${course.name} instructor`);
      const courseMemberObject = await guild.roles.cache.find(r => r.name === `${course.name}`);
      if (foundUser) {
        if (currentMember.instructor) {
          if (!foundUser.roles.cache.some(r => r.id === instructorRoleObject.id)) {
            statusMessage += foundUser.nickname + `: missing instructor role on ${course.name}\n`;
          }
        }
        if (!foundUser.roles.cache.some(r => r.id === courseMemberObject.id)) {
          statusMessage += foundUser.nickname + `: not joined on ${course.name}\n`;
        }
      }
    }

    if (statusMessage === "") {
      statusMessage = "All users are in appropriate courses and have respective instructor roles";
    }
    message.reply("Course member/instructor roles:\n" + statusMessage);

    statusMessage = "";

    await Promise.all(guild.channels.cache.map(async aChannel => {
      if (aChannel.type !== "GUILD_CATEGORY") {
        const channelToRemove = await getChannelByDiscordId(aChannel.id, models.Channel);
        if (!channelToRemove) {
          if (aChannel.parent) {
            const parentId = aChannel.parent.id;
            const parent = await getCourseByDiscordId(parentId, models.Course);
            if (parent) {
              statusMessage += `${aChannel.name}\n`;
            }
          }
        }
      }
    }));
    if (statusMessage === "") {
      statusMessage = "Every course channel in database";
    }
    message.reply("Channels that are not in database:\n" + statusMessage);
  }
};


const emojiName = (currentCourse) => {
  if (!currentCourse.locked && !currentCourse.private) {
    return "📚 " + currentCourse.name;
  }
  else if (!currentCourse.locked && currentCourse.private) {
    return "👻 " + currentCourse.name;
  }
  else if (currentCourse.locked && !currentCourse.private) {
    return "📚🔐 " + currentCourse.name;
  }
  else if (currentCourse.locked && currentCourse.private) {
    return "👻🔐 " + currentCourse.name;
  }
};


module.exports = {
  prefix: true,
  name: "server_status",
  description: "Check if Discord server and database are in sync",
  role: "admin",
  usage: "!server_status",
  args: false,
  execute,
};