const { possibleRolesArray } = require("../../util.js");
const updateGuide = require("../../updateGuide");

const removeRole = async (user, roleString) => {
  const role = possibleRolesArray().find(
    (r) => r.name === roleString,
  );
  if (!role) throw new Error("Role does not exist or is not available");
  user.roles.remove(role);
};

const execute = async (message, args) => {
  const courseString = args.join(" ");
  const who = message.member;

  const roleRemoved = await removeRole(who, courseString);
  updateGuide();
  return roleRemoved;
};

module.exports = {
  name: "leave",
  args: true,
  description: "Remove you from the course, e.g. `!leave ohpe`",
  execute,
};