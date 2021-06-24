const { findOrCreateRoleWithName, createInvitation, createCategoryName } = require("../../service");
const { sendEphemeral } = require("../utils");

/**
 *
 * @param {Object} channelObject
 * @param {Discord.GuildChannel} parent
 */
const findOrCreateChannel = async (channelObject, guild) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name);
  if (alreadyExists) return alreadyExists;
  return await guild.channels.create(name, options);
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

const getChannelObjects = (guild, admin, student, roleName, category) => {
  return [
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
};

const getCategoryObject = (categoryName, permissionOverwrites) => ({
  name: categoryName,
  options: {
    type: "category",
    permissionOverwrites,
  },
});

const execute = async (client, interaction) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  sendEphemeral(client, interaction, `Created course ${courseName}.`);

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
  await createInvitation(guild, courseName);
};

module.exports = {
  name: "create",
  description: "Create a new course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  options: [
    {
      name: "course",
      description: "Course to create.",
      type: 3,
      required: true,
    },
  ],
  execute,
};
