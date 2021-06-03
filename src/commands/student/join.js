const { possibleRolesArray } = require("../../service");

const updateGuide = require("../../updateGuide");

const addRole = async (user, roleString, guild) => {
  const role = await possibleRolesArray(guild).find(
    (r) => r.name === roleString,
  );
  if (!role) throw new Error("Role does not exist or is not available");
  user.roles.add(role);
};

const execute = async (message, args) => {
  const who = message.member;

  const roleAdded = await addRole(who, args, message.guild);
  // updateGuide();
  return roleAdded;
};

module.exports = {
  name: "join",
  description: "Join to the course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  execute,
};
