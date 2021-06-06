const { getRoleFromCategory, findOrCreateRoleWithName, context } = require("./util");

const createCategoryName = (courseString) => `📚 ${courseString}`;

/**
 *
 * @param {Object} channelObject
 * @param {Discord.GuildChannel} parent
 */
const findOrCreateChannel = (channelObject) => {
  const { guild } = context;
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name,
  );
  if (alreadyExists) return alreadyExists;
  return guild.channels.create(name, options);
};

const findAndDeleteChannel = (channelObject) => {
  return channelObject.delete();
};

const findAndDeleteRole = (role) => {
  return role.delete();
};

/**
 *
 * @param {String} courseName
 * @param {String} roleName
 * @param {Discord.Role} studentRole
 * @param {Discord.Role} adminRole
 */
const findOrCreateCategoryWithName = async (
  courseName,
  roleName,
  studentRole,
  adminRole,
) => {
  const { guild } = context;
  const categoryName = createCategoryName(courseName, roleName);
  const permissionOverwrites = [
    {
      id: guild.id,
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: guild.me.roles.highest,
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: adminRole.id,
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: studentRole.id,
      allow: ["VIEW_CHANNEL"],
    },
  ];

  const categoryObject = {
    name: categoryName,
    options: {
      type: "category",
      permissionOverwrites,
    },
  };

  return findOrCreateChannel(categoryObject);
};

/**
 *
 * @param {Discord.GuildMember} user
 * @param {String} courseName
 */
const createCourse = async (user, courseString) => {
  const { guild } = context;
  if (user.roles.highest.name !== "admin") { throw new Error("You have no power here!"); }
  const roleName = getRoleFromCategory(courseString);

  const studentRole = await findOrCreateRoleWithName(roleName);
  const adminRole = await findOrCreateRoleWithName(`${roleName} admin`);

  const category = await findOrCreateCategoryWithName(
    courseString,
    roleName,
    studentRole,
    adminRole,
    guild,
  );

  const CHANNELS = [
    {
      name: `${roleName}_announcement`,
      options: {
        type: "text",
        description: "Messages from course admins",
        parent: category,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: studentRole,
            deny: ["SEND_MESSAGES"],
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: adminRole,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
          },
        ],
      },
    },
    {
      name: `${roleName}_general`,
      parent: category,
      options: { type: "text", parent: category, permissionOverwrites: [] },
    },
    {
      name: `${roleName}_questions`,
      parent: category,
      options: { type: "text", parent: category, permissionOverwrites: [] },
    },
    {
      name: `${roleName}_voice`,
      parent: category,
      options: { type: "voice", parent: category, permissionOverwrites: [] },
    },
  ];

  await CHANNELS.reduce(async (promise, channel) => {
    await promise;

    return findOrCreateChannel(channel);
  }, Promise.resolve());

};

const deleteCourse = async (user, courseString) => {
  const { guild } = context;
  if (user.roles.highest.name !== "admin") { throw new Error("You have no power here!"); }
  const courseString2 = createCategoryName(courseString);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString2);
  await guild.channels.cache.map(c => c).filter(c => (c.parent === category || (c.type === "category" && c.name === courseString2))).reduce(async (promise, channel) => {
    await promise;
    return findAndDeleteChannel(channel);
  }, Promise.resolve());

  await guild.roles.cache.map(r => r).filter(r => (r.name === `${courseString} admin` || r.name === `${courseString}`)).reduce(async (promise, role) => {
    await promise;

    return findAndDeleteRole(role);
  }, Promise.resolve());

};

module.exports = {
  createCourse,
  deleteCourse,
};
