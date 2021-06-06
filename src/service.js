const GUIDE_CHANNEL_NAME = "guide";
const COMMAND_CHANNEL_NAME = "commands";

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

/**
 *
 * @param {Discord.Message} message
 */
const updateGuideMessage = async (message, commands, guild) => {
  const rows = await message.guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      const count = guild.roles.cache.find(
        (role) => role.name === courseRole,
      ).members.size;
      return `  - ${courseFullName} \`!join ${courseRole}\` 👤${count}`;
    }).sort((a, b) => a.localeCompare(b));

  const newContent = `
Käytössäsi on seuraavia komentoja:
  - \`!join\` jolla voit liittyä kurssille
  - \`!leave\` jolla voit poistua kurssilta
Esim: \`!join ohpe\`
  
You have the following commands available:
  - \`!join\` which you can use to join a course
  - \`!leave\` which you can use to leave a course
For example: \`!join ohpe\`

Kurssit / Courses:
${rows.join("\n")}

In course specific channels you can also list instructors \`!instructors\`

See more with \`!help\` and test out the commands in <#${commands.id}> channel!
`;

  message.edit(newContent);
};

/**
 *
 * @param {Discord.Guild} guild
 */
const updateGuide = async (guild) => {
  const channel = await guild.channels.cache.find(
    (c) => c.name === GUIDE_CHANNEL_NAME,
  );
  const command = await guild.channels.cache.find(
    (c) => c.name === COMMAND_CHANNEL_NAME,
  );
  const messages = await channel.messages.fetchPinned(true);
  const message = messages.first();
  await updateGuideMessage(message, command, guild);
};

module.exports = {
  getRoleFromCategory,
  findOrCreateRoleWithName,
  possibleRolesArray,
  createChannelInCategory,
  updateGuide,
};
