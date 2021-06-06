/**
 * Expects role to be between parenthesis e.g. (role)
 * @param {String} string
 */
const getRoleFromCategory = (categoryName) => {
  const cleaned = categoryName.replace("📚", "").trim();
  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(cleaned);
  return matches?.[1] || cleaned;
};

/**
 *
 * @param {String} name
 */
const findOrCreateRoleWithName = async (name, guild) => {
  return (
    guild.roles.cache.find((role) => role.name === name) ||
    (await guild.roles.create({
      data: {
        name,
      },
    }))
  );
};

const createChannelInCategory = async (guild, channelName, categoryName) => {
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === categoryName) ||
    await guild.channels.create(
      categoryName,
      {
        type: "category",
      });
  const createdChannel = await guild.channels.create(channelName);
  await createdChannel.setParent(category.id);
  return createdChannel;
};


const possibleRolesArray = (guild) => {
  const rolesFromCategories = guild.channels.cache
    .filter(({ type, name }) => type === "category" && name.startsWith("📚"))
    .map(({ name }) => getRoleFromCategory(name));

  const actualRoles = guild.roles.cache.filter((role) =>
    rolesFromCategories.includes(role.name),
  );
  if (rolesFromCategories.length !== actualRoles.size) {
    console.log(
      "Something is wrong, rolesFromCategories did not match the size of actualRoles",
      rolesFromCategories,
      rolesFromCategories.length,
      actualRoles.map(({ name }) => name),
      actualRoles.size,
    );
  }
  return actualRoles;
};

module.exports = {
  getRoleFromCategory,
  findOrCreateRoleWithName,
  possibleRolesArray,
  createChannelInCategory,
};
