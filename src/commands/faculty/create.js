const { findOrCreateRoleWithName, createInvitation, createCategoryName } = require("../../service");

/**
 *
 * @param {Object} channelObject
 * @param {Discord.GuildChannel} parent
 */
const findOrCreateChannel = async (channelObject, guild) => {
  const { name, parent, options } = channelObject;
  return guild.channels.cache.find(
    (c => (c.type === options.type && c.name === name && c.parent === parent)))
    || await guild.channels.create(name, options);
};

const getPermissionOverwrites = (guild, admin, student) => ([
  {
    id: guild.id,
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: guild.me.roles.highest,
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: admin.id,
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: student.id,
    allow: ["VIEW_CHANNEL"],
  },
]);

const getChannelObjects = (guild, admin, student, roleName, category) => [
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
          id: student,
          deny: ["SEND_MESSAGES"],
          allow: ["VIEW_CHANNEL"],
        },
        {
          id: admin,
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

const getCategoryObject = (categoryName, permissionOverwrites) => ({
  name: categoryName,
  options: {
    type: "category",
    permissionOverwrites,
  },
});

const execute = async (message, args) => {
  const role = message.member.roles.cache.find(r => r.name === "teacher");
  if (!role) {
    throw new Error("You have no power here!");
  }

  const courseName = args;
  const guild = message.guild;

  // Roles
  const student = await findOrCreateRoleWithName(courseName, guild);
  const admin = await findOrCreateRoleWithName(`${courseName} admin`, guild);

  // Category
  const categoryName = createCategoryName(courseName);
  const categoryObject = getCategoryObject(categoryName, getPermissionOverwrites(guild, admin, student));
  const category = await findOrCreateChannel(categoryObject, guild);

  // Channels
  const channelObjects = getChannelObjects(guild, admin, student, courseName, category);
  await Promise.all(channelObjects.map(
    async channelObject => await findOrCreateChannel(channelObject, guild),
  ));
  await createInvitation(message.guild, args);
};

module.exports = {
  name: "create",
  description: "Create new course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  execute,
};
