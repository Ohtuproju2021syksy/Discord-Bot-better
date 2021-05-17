const { findOrCreateRoleWithName, context } = require("./util");
const FACULTY_ROLE = "faculty";

const updateFaculty = async () => {
  const { guild } = context
  const facultyRole = await findOrCreateRoleWithName(FACULTY_ROLE);
  const usersWhoShouldBeFaculty = guild.roles.cache
    .filter((role) => role.name.includes("admin"))
    .reduce((acc, role) => [...acc, ...role.members.array()], []);

  await usersWhoShouldBeFaculty.reduce(async (promise, user) => {
    await promise;
    if (user.roles.cache.find((role) => role.id === facultyRole.id))
      return Promise.resolve();
    console.log("Gave faculty to", user.nickname);
    return user.roles.add(facultyRole);
  }, Promise.resolve());
};

module.exports = updateFaculty;
