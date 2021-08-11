const { courseAdminRole } = require("../../../../config.json");
const { findAllCourseNames } = require("../../services/service");

const findAndUpdateInstructorRole = async (name, guild) => {
  const oldInstructorRole = guild.roles.cache.find((role) => role.name !== name && role.name.includes(name));
  oldInstructorRole.setName(`${name} ${courseAdminRole}`);
};

const execute = async (message) => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const courseNames = findAllCourseNames(guild);

    courseNames.forEach(course => {
      findAndUpdateInstructorRole(course, guild);
    });
  }
};

module.exports = {
  prefix: true,
  name: "updateinstructors",
  description: "Update course admin roles.",
  role: "admin",
  execute,
};
