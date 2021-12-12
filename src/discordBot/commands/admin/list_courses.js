const { getAllCourses } = require("../../../db/services/courseService");
const { findChannelsByCourse, getAllChannels } = require("../../../db/services/channelService");


const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    let statusMessage = "";
    const allCourses = await getAllCourses(models.Course);
    for (const course in allCourses) {
      const currentCourse = allCourses[course];


      statusMessage += "Course: " + currentCourse.name + " " + currentCourse.categoryId + "\n";


      const courseChannels = await findChannelsByCourse(currentCourse.id, models.Channel);

      for (const channel in courseChannels) {
        const currentChannel = courseChannels[channel];
        statusMessage += currentChannel.name + " " + currentChannel.discordId + "\n";
      }
      statusMessage += "\n";
    }

    if (statusMessage.length >= 2000 && statusMessage < 4000) {
      message.reply("Courses:\n" + statusMessage.substring(0, 1987));
      message.reply(statusMessage.substring(1988, statusMessage.length - 1));
    }
    else if (statusMessage.length < 2000) {
      message.reply("Courses:\n" + statusMessage);
    }
    else {
      message.reply("Too long message");
    }


    statusMessage = "";
    const allChannels = await getAllChannels(models.Channel);
    for (const channel in allChannels) {
      const currentChannel = allChannels[channel];
      statusMessage += currentChannel.name + " " + currentChannel.discordId + "\n";
    }

    if (statusMessage.length >= 2000 && statusMessage < 4000) {
      message.reply("Courses:\n" + statusMessage.substring(0, 1987));
      message.reply(statusMessage.substring(1988, statusMessage.length - 1));
    }
    else if (statusMessage.length < 2000) {
      message.reply("Courses:\n" + statusMessage);
    }
    else {
      message.reply("Too long message");
    }

  }
};


module.exports = {
  prefix: true,
  name: "list_courses",
  description: "List all courses and channels",
  role: "admin",
  usage: "!list_courses",
  args: false,
  execute,
};