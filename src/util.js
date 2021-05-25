const { commandsChannel, commandsCategory } = require("../config.json");
const GUILD_ID = process.env.GUILD_ID;

const context = {
  ready: false,
};
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
  const { guild } = context;
  return (
    guild.roles.cache.find((role) => role.name === name) ||
    (await guild.roles.create({
      data: {
        name,
      },
    }))
  );
};

const initializeChannels = async () => {
  const category = await context.guild.channels.create(
    commandsCategory,
    {
      type: "category",
      permissionOverwrites: [
        {
          id: context.guild.me.roles.highest,
          allow: ["VIEW_CHANNEL"],
        },
      ],
    });
  const channel = await context.guild.channels.create(commandsChannel);
  await channel.setParent(category.id);
  context.commands = channel;
  process.env["CHANNEL_ID"] = channel.id;
};

const initializeApplicationContext = async (client) => {
  context.guild = await client.guilds.fetch(GUILD_ID);
  context.commands = context.guild.channels.cache.find(c => c.type === "text" && c.name === commandsChannel);
  if (!context.commands) {
    await initializeChannels();
  }
  context.ready = true;
  console.log("Initialized");
};

const possibleRolesArray = () => {
  const { guild } = context;

  const rolesFromCategories = guild.channels.cache
    .filter(({ type, name }) => type === "category" && name.startsWith("📚"))
    .map(({ name }) => getRoleFromCategory(name));

  const existingRoles = guild.roles.cache;

  const acualRoles = existingRoles.filter((role) =>
    rolesFromCategories.includes(role.name),
  );
  if (rolesFromCategories.length !== acualRoles.size) {
    console.log(
      "Something is wrong, rolesFromCategories did not match the size of acualRoles",
      rolesFromCategories,
      rolesFromCategories.length,
      acualRoles.map(({ name }) => name),
      acualRoles.size,
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
