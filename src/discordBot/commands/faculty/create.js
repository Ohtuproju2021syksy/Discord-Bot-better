const { SlashCommandBuilder } = require("@discordjs/builders");

const {
  findOrCreateRoleWithName,
  createInvitation,
  findCategoryName,
  updateGuide,
  findOrCreateChannel,
  setCoursePositionABC,
  createCourseToDatabase,
  findCourseFromDb,
  findCourseFromDbWithFullName } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

/*
const printCourses = async () => {
  const courses = await Course.findAll();
  console.log("All courses in db:", JSON.stringify(courses, null, 2));
};
*/
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
        type: "GUILD_TEXT",
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
      options: { type: "GUILD_TEXT", parent: category, permissionOverwrites: [] },
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

const execute = async (interaction, client, Course) => {
  const courseCode = interaction.options.getString("input").value.toLowerCase().trim();
  const courseFullName = interaction.data.options[1].value.toLowerCase().trim();
  if (await findCourseFromDbWithFullName(courseFullName, Course)) return sendEphemeral(client, interaction, "Error: Course fullname must be unique.");

  let courseName;
  if (!interaction.data.options[2]) {
    courseName = courseCode;
  }
  else {
    courseName = interaction.data.options[2].value.toLowerCase().trim();
  }
  if (await findCourseFromDb(courseName, Course)) return sendEphemeral(client, interaction, "Error: Course name must be unique.");

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

  // Database
  await createCourseToDatabase(courseCode, courseFullName, courseName, Course);
  // await printCourses();
  await setCoursePositionABC(guild, categoryName);
  await createInvitation(guild, courseName);
  sendEphemeral(client, interaction, `Created course ${courseName}.`);
  await client.emit("COURSES_CHANGED", Course);
  await updateGuide(client.guild, Course);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a new course.")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("coursecode")
        .setDescription("Course coursecode")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("full_name")
        .setDescription("Course full name")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("nick_name")
        .setDescription("Course nick name")
        .setRequired(false)),
  execute,
  usage: "/create [course name]",
  description: "Create a new course.",
  roles: ["admin", facultyRole],
};
