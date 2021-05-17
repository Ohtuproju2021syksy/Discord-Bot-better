const { possibleRolesArray } = require("./util");

/**
 *
 * @param {Discord.GuildMember} user
 * @param {String} roleString
 */
const removeRole = async (user, roleString) => {
  const role = possibleRolesArray().find(
    (role) => role.name === roleString
  );
  if (!role) throw new Error("Role does not exist or is not available");
  user.roles.remove(role);
};

/**
 *
 * @param {Discord.GuildMember} user
 * @param {String} roleString
 */
const addRole = async (user, roleString) => {
  const role = possibleRolesArray().find(
    (role) => role.name === roleString
  );
  if (!role) throw new Error("Role does not exist or is not available");
  user.roles.add(role);
};

module.exports = {
  addRole,
  removeRole,
};
