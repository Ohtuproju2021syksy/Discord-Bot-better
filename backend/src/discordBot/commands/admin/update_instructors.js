const { courseAdminRole } = require("../../../../config.json");
const { findAndUpdateInstructorRole } = require("../../services/service");
const { findAllCourseNames } = require("../../../db/services/courseService");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const courseNames = await findAllCourseNames(models.Course);

    for (const course in courseNames) {
      findAndUpdateInstructorRole(courseNames[course], guild, courseAdminRole);
    }
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
