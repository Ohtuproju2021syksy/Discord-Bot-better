const GUIDE_CHANNEL_NAME = "guide";
const COMMAND_CHANNEL_NAME = "commands";
const FACULTY_ROLE = "faculty";
const { Invites } = require("./dbInit");

const createCategoryName = (courseString) => `📚 ${courseString}`;

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

  const guideinvite = message.guild.invites.find(invite => invite.course === "guide");
  const rows = guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      const count = guild.roles.cache.find(
        (role) => role.name === courseRole,
      ).members.size;
      return `  - ${courseFullName} \`!join ${courseRole}\` 👤${count}`;
    }).sort((a, b) => a.localeCompare(b));

  const commands = guild.channels.cache.find(
    (channel) => channel.name === COMMAND_CHANNEL_NAME,
  );

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

Invitation link for the server https://discord.gg/${guideinvite.code}
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

const findOrCreateInviteToDatabase = async (guild, invite, args) => {
  const inviteFound = guild.invites.get(invite.code);
  if (inviteFound) {
    inviteFound.code = invite.code;
    inviteFound.course = args;
    inviteFound.save();
  }
  else {
    const newInvite = await Invites.create({ code: invite.code, course: args });
    guild.invites.set(invite.id, newInvite);
  }
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

  const invite = await guide.createInvite({ maxAge: 0, unique: true, reason: args });
  const invitationlink = `Invitation link for the course https://discord.gg/${invite.code}`;
  await findOrCreateInviteToDatabase(guild, invite, args);

  guild.inv = await guild.fetchInvites();

  const message = await course.send(invitationlink);
  await message.pin();
};

const findInviteFromDBwithCourse = async (name) => {
  return await Invites.findOne({ where: { course: name } });
};

const findInvite = async (guild, code) => {
  return guild.invites.get(code);
};

const deleteInvite = async (guild, course) => {
  const invite = await Invites.destroy({ where: { course: course } });
  guild.invites.delete(invite.code);
};

module.exports = {
  getRoleFromCategory,
  findOrCreateRoleWithName,
  possibleRolesArray,
  createChannelInCategory,
  updateGuide,
  createInvitation,
  createCategoryName,
  findInvite,
  deleteInvite,
  findOrCreateInviteToDatabase,
  findInviteFromDBwithCourse,
};
