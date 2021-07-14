require("dotenv").config();
const GUIDE_CHANNEL_NAME = "guide";
const COMMAND_CHANNEL_NAME = "commands";
const FACULTY_ROLE = "faculty";

let invite_url = "";

process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

const createCategoryName = (courseString) => `📚 ${courseString}`;

const createPrivateCategoryName = (courseString) => `🔒 ${courseString}`;

/**
 * Expects role to be between parenthesis e.g. (role)
 * @param {String} string
 */
const getRoleFromCategory = (categoryName) => {
  let cleaned = null;
  if (categoryName.includes("📚")) {
    cleaned = categoryName.replace("📚", "").trim();
  }
  else {
    cleaned = categoryName.replace("🔒", "").trim();
  }
  // const cleaned = categoryName.replace("📚", "").trim();
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

/**
 *
 * @param {Discord.Message} message
 */
const updateFaculty = async (guild) => {
  const facultyRole = await findOrCreateRoleWithName(FACULTY_ROLE, guild);
  const usersWhoShouldBeFaculty = guild.roles.cache
    .filter((role) => role.name.includes("admin"))
    .reduce((acc, role) => [...acc, ...role.members.array()], []);

  for (const member of usersWhoShouldBeFaculty) {
    if (!member.roles.cache.find((role) => role.id === facultyRole.id)) {
      await member.roles.add(facultyRole);
      await member.fetch(true);
      console.log("Gave faculty to", member.nickname || member.user.username);
    }
  }
};

const updateGuideMessage = async (message) => {
  const guild = message.guild;
  const invites = await guild.fetchInvites();
  const guideInvite = invites.find(invite => invite.channel.name === "guide");
  const rows = guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      const count = guild.roles.cache.find(
        (role) => role.name === courseRole,
      ).members.size;
      return `  - ${courseFullName} \`/join ${courseRole}\` 👤${count}`;
    }).sort((a, b) => a.localeCompare(b));

  const commands = guild.channels.cache.find(
    (channel) => channel.name === COMMAND_CHANNEL_NAME,
  );

  const newContent = `
Käytössäsi on seuraavia komentoja:
  - \`/join\` jolla voit liittyä kurssille
  - \`/leave\` jolla voit poistua kurssilta
Esim: \`/join ohpe\`
  
You have the following commands available:
  - \`/join\` which you can use to join a course
  - \`/leave\` which you can use to leave a course
For example: \`/join ohpe\`

Kurssit / Courses:
${rows.join("\n")}

In course specific channels you can also list instructors \`/instructors\`

See more with \`/help\` and test out the commands in <#${commands.id}> channel!

Invitation link for the server https://discord.gg/${guideInvite.code}
`;

  await message.edit(newContent);
};

const updateGuide = async (guild) => {
  await updateFaculty(guild);
  const channel = guild.channels.cache.find(
    (c) => c.name === GUIDE_CHANNEL_NAME,
  );
  const messages = await channel.messages.fetchPinned(true);
  const message = messages.first();
  await updateGuideMessage(message);
};

const createInvitation = async (guild, args) => {
  const guide = guild.channels.cache.find(
    c => c.type === "text" && c.name === "guide",
  );
  const name = createCategoryName(args);
  const category = guild.channels.cache.find(
    c => c.type === "category" && c.name === name,
  );
  const course = guild.channels.cache.find(
    (c => c.parent === category),
  );
  let invitationlink;
  if (args === GUIDE_CHANNEL_NAME) {
    const invite = await guide.createInvite({ maxAge: 0, unique: true, reason: args });
    invitationlink = `Invitation link for the course https://discord.gg/${invite.code}`;
  }
  else {
    invitationlink = `Invitation link for the course ${invite_url}/invite/${args}`;
  }


  const message = await course.send(invitationlink);
  await message.pin();
};

const findCategoryName = (courseString, guild) => {
  const categorypublic = createCategoryName(courseString);
  const categoryprivate = createPrivateCategoryName(courseString);
  try {
    const publicCourse = guild.channels.cache.find(c => c.type === "category" && c.name === categorypublic);
    const privateCourse = guild.channels.cache.find(c => c.type === "category" && c.name === categoryprivate);
    if (!publicCourse && privateCourse) {
      return categoryprivate;
    }
    else {
      return categorypublic;
    }
  }
  catch (error) {
    // console.log(error);
  }
};

const createNewGroup = async (args, Groups) => {
  const courseName = args[0];
  const groupId = parseInt(args[1]);

  const newGroup = await Groups.create({ group: groupId, course: courseName });
  console.log(newGroup);
};

module.exports = {
  createCategoryName,
  createPrivateCategoryName,
  getRoleFromCategory,
  findOrCreateRoleWithName,
  updateFaculty,
  updateGuideMessage,
  updateGuide,
  createInvitation,
  findCategoryName,
  createNewGroup,
};
