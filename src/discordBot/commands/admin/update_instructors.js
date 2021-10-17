const { courseAdminRole } = require("../../../../config.json");
const { findAllCourseNames, findAndUpdateInstructorRole } = require("../../services/service");

const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const courseNames = findAllCourseNames(guild);

    courseNames.forEach(course => {
      findAndUpdateInstructorRole(course, guild, courseAdminRole);
    });
  }
};

module.exports = {
  prefix: true,
  name: "update_instructors",
  description: "Update course instructor roles.",
  role: "admin",
  usage: "!update_instructors",
  args: false,
  execute,
};
