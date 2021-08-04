const { findOrCreateRoleWithName, createInvitation, findCategoryName, updateGuide, findOrCreateChannel, setCoursePositionABC } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

/**
 *
 * @param {Object} channelObject
 * @param {Discord.GuildChannel} parent
 */

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
  roleName = roleName.replace(/ /g, "-");
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

const execute = async (interaction, client) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  // Roles
  const student = await findOrCreateRoleWithName(courseName, guild);
  const admin = await findOrCreateRoleWithName(`${courseName} ${courseAdminRole}`, guild);

  // Category
  const categoryName = findCategoryName(courseName, guild);
  const categoryObject = getCategoryObject(categoryName, getPermissionOverwrites(guild, admin, student));
  const category = await findOrCreateChannel(categoryObject, guild);

  // Channels
  const channelObjects = getChannelObjects(guild, admin, student, courseName, category);
  await Promise.all(channelObjects.map(
    async channelObject => await findOrCreateChannel(channelObject, guild),
  ));

  await setCoursePositionABC(guild, categoryName);
  await createInvitation(guild, courseName);
  sendEphemeral(client, interaction, `Created course ${courseName}.`);
  await client.emit("COURSES_CHANGED");
  await updateGuide(client.guild);
};

module.exports = {
  name: "create",
  description: "Create a new course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: facultyRole,
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
