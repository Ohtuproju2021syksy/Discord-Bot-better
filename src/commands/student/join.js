const { possibleRolesArray } = require("../../util.js");
const updateGuide = require("../../updateGuide");

const addRole = async (user, roleString) => {
  const role = possibleRolesArray().find(
    (r) => r.name === roleString,
  );
  if (!role) throw new Error("Role does not exist or is not available");
  user.roles.add(role);
};

const execute = async (message, args) => {
  const courseString = args.join(" ");
  const who = message.member;

  const roleAdded = await addRole(who, courseString);
  updateGuide();
  return roleAdded;
};

module.exports = {
  name: "join",
  args: true,
  description: "Join to the course.",
  execute,
};
