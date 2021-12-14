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

    for (let i = 0; i < statusMessage.length;) {
      message.reply(statusMessage.substring(i, i + 1000));
      i += 1000;
    }


    statusMessage = "";
    const allChannels = await getAllChannels(models.Channel);
    for (const channel in allChannels) {
      const currentChannel = allChannels[channel];
      statusMessage += currentChannel.name + " " + currentChannel.discordId + "\n";
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