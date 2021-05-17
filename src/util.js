const GUILD_ID = '757581218085863474'

const context = {
  ready: false
}
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
const findOrCreateRoleWithName = async (name) => {
  const { guild } = context
  return (
    guild.roles.cache.find((role) => role.name === name) ||
    (await guild.roles.create({
      data: {
        name,
      },
    }))
  );
};

const initializeApplicationContext = async (client) => {
  context.guild = await client.guilds.fetch(GUILD_ID)
  context.commands = context.guild.channels.cache.find(c => c.type === 'text' && c.name === 'commands')

  context.ready = true
  console.log('Initialized')
}

const possibleRolesArray = () => {
  const { guild } = context

  const rolesFromCategories = guild.channels.cache
    .filter(({ type, name }) => type === "category" && name.startsWith("📚"))
    .map(({ name }) => getRoleFromCategory(name));

  const existingRoles = guild.roles.cache;

  const acualRoles = existingRoles.filter((role) =>
    rolesFromCategories.includes(role.name)
  );
  if (rolesFromCategories.length !== acualRoles.size) {
    console.log(
      "Something is wrong, rolesFromCategories did not match the size of acualRoles",
      rolesFromCategories,
      rolesFromCategories.length,
      acualRoles.map(({ name }) => name),
      acualRoles.size
    );
  }
  return acualRoles;
};


module.exports = {
  initializeApplicationContext,
  getRoleFromCategory,
  findOrCreateRoleWithName,
  possibleRolesArray,
  context,
};
