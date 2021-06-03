const findOrCreateChannel = (guild, channelObject) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name,
  );
  if (alreadyExists) return alreadyExists;
  return guild.channels.create(name, options);
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
const findOrCreateRoleWithName = async (guild, name) => {
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
  const category = await guild.channels.cache.find(c => c.type === "category" && c.name === categoryName) ||
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

const initChannels = async (guild, categoryName) => {
  const adminRole = await findOrCreateRoleWithName(guild, "admin");
  const category = await guild.channels.cache.find(c => c.type === "category" && c.name === categoryName) ||
  await guild.channels.create(
    categoryName,
    {
      type: "category",
    });

  const channels = [
    {
      name: "commands",
      options: {
        parent: category,
        type: "text",
      },
    },
    {
      name: "guide",
      options: {
        parent: category,
        type: "text",
        topic: " ",
        permissionOverwrites: [{ id: guild.id, deny: ["SEND_MESSAGES"], "allow": ["VIEW_CHANNEL"] }, { id: adminRole.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] } ],
      },
    },
  ];
  await channels.reduce(async (promise, channel) => {
    await promise;
    await findOrCreateChannel(guild, channel);
  }, Promise.resolve());

};

const setInitialGuideMessage = async (guild, channelName) => {
  const guideChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
  if(!guideChannel.lastPinTimestamp) {
    const msg = await guideChannel.send("initial");
    await msg.pin();
  }
};

const setCommandsChannel = (context) =>{
  const channel = context.guild.channels.cache.find(c => c.type === "text" && c.name === "commands");
  process.env["CHANNEL_ID"] = channel.id;
  context.commands = channel;
};

const initializeApplicationContext = async (guild, commandsCategory) => {
  await initChannels(guild, commandsCategory);
  await setInitialGuideMessage(guild, "guide");
};

module.exports = {
  getRoleFromCategory,
  findOrCreateRoleWithName,
  possibleRolesArray,
  createChannelInCategory,
  initializeApplicationContext,
  setCommandsChannel,
};
