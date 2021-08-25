const { courseAdminRole } = require("../../../../config.json");
const { findAllCourseNames, findAndUpdateInstructorRole } = require("../../services/service");

const execute = async (message) => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const courseNames = findAllCourseNames(guild);

    courseNames.forEach(course => {
      findAndUpdateInstructorRole(course, guild, courseAdminRole);
    });
  }
};

module.exports = {
  prefix: true,
  name: "updateinstructors",
  description: "Update course admin roles.",
  role: "admin",
  usage: "!updateinstructors",
  args: false,
  execute,
};
