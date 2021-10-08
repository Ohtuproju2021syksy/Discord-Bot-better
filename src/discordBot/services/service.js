const { Sequelize } = require("sequelize");

require("dotenv").config();
const GUIDE_CHANNEL_NAME = "guide";

let invite_url = "";

process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

const createCategoryName = (courseString) => `📚 ${courseString}`;

const createPrivateCategoryName = (courseString) => `🔒 ${courseString}`;

const cooldownMap = new Map();

const cooldownTimeMs = 1000 * 60 * 5;

/**
 * Expects role to be between parenthesis e.g., (role)
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
      name,
    }))
  );
};

const updateGuideMessage = async (message, Course) => {
  const guild = message.guild;
  const courseData = await findCoursesFromDb("code", Course, false);
  const rows = courseData
    .map((course) => {
      const regExp = /[^0-9]*/;
      const fullname = course.fullName;
      const matches = regExp.exec(course.code)?.[0];
      const code = matches ? matches + course.code.slice(matches.length) : course.code;
      const count = guild.roles.cache.find(
        (role) => role.name === course.name,
      )?.members.size;
      return `  - ${code} - ${fullname} - \`/join ${course.name}\` 👤${count}`;
    });

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

See more with \`/help\` command.

Invitation link for the server ${invite_url}
`;

  await message.edit(newContent);
};

const updateGuide = async (guild, Course) => {
  const channel = guild.channels.cache.find(
    (c) => c.name === GUIDE_CHANNEL_NAME,
  );
  const messages = await channel.messages.fetchPinned(true);
  const message = messages.first();
  await updateGuideMessage(message, Course);
};

const createCourseInvitationLink = (courseName) => {
  courseName = courseName.replace(/ /g, "%20").trim();
  return `Invitation link for the course ${invite_url}/join/${courseName}`;
};

const createInvitation = async (guild, args) => {
  const guide = guild.channels.cache.find(
    c => c.type === "GUILD_TEXT" && c.name === "guide",
  );
  let name;
  let category;

  name = createCategoryName(args);
  category = guild.channels.cache.find(
    c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === name.toLowerCase(),
  );
  if (!category) {
    name = createPrivateCategoryName(args);
    category = guild.channels.cache.find(
      c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === name.toLowerCase(),
    );
  }
  const course = guild.channels.cache.find(
    (c => c.parent === category),
  );
  let invitationlink;
  if (args === GUIDE_CHANNEL_NAME) {
    await guide.createInvite({ maxAge: 0, unique: true, reason: args });
    invitationlink = `Invitation link for the server ${invite_url}`;
  }
  else {
    invitationlink = createCourseInvitationLink(args);
  }

  const message = await course.send(invitationlink);
  await message.pin();
};

const findCategoryName = (courseString, guild) => {
  const categorypublic = createCategoryName(courseString);
  const categoryprivate = createPrivateCategoryName(courseString);
  try {
    const publicCourse = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === categorypublic.toLowerCase());
    const privateCourse = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === categoryprivate.toLowerCase());
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

const findChannelWithNameAndType = (name, type, guild) => {
  return guild.channels.cache.find(c => c.type === type && c.name.toLowerCase() === name.toLowerCase());
};

const findChannelWithId = (id, guild) => {
  return guild.channels.cache.get(id);
};

const msToMinutesAndSeconds = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds}`;
};

const checkCourseCooldown = (courseName) => {
  return cooldownMap.get(courseName);
};

const handleCooldown = (courseName) => {
  if (!cooldownMap.has(courseName)) {
    cooldownMap.set(courseName, cooldownTimeMs + Date.now());
  }
  setTimeout(() => {
    cooldownMap.delete(courseName);
  }, cooldownTimeMs);
};

const findOrCreateChannel = async (channelObject, guild) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name.toLowerCase() === name.toLowerCase());
  if (alreadyExists) return alreadyExists;
  return await guild.channels.create(name, options);
};

const setCoursePositionABC = async (guild, courseString) => {
  let first = 9999;
  const result = guild.channels.cache
    .filter(c => c.type === "GUILD_CATEGORY" && c.name.startsWith("📚"))
    .map((c) => {
      const categoryName = c.name;
      if (first > c.position) first = c.position;
      return categoryName;
    }).sort((a, b) => a.localeCompare(b));

  const category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase() === courseString.toLowerCase());
  if (category) {
    await category.edit({ position: result.indexOf(courseString) + first });
  }
};

const deleteCommand = async (client, commandToDeleteName) => {
  client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.get().then(commands => {
    commands.forEach(async command => {
      if (command.name === commandToDeleteName) {
        await client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands(command.id).delete();
      }
    });
  });
};

const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

const isACourseCategory = (channel) => {
  return emojiRegex.test(channel.name);
};

const trimCourseName = (channel) => {
  let trimmedName = "";
  if (channel.name) {
    trimmedName = channel.name.replace(emojiRegex, "").trim();
  }
  else {
    trimmedName = channel.replace(emojiRegex, "").trim();
  }

  return trimmedName;
};

const findAllCourseNames = (guild) => {
  const courseNames = [];

  guild.channels.cache.forEach(channel => {
    if (isACourseCategory(channel)) {
      courseNames.push(trimCourseName(channel));
    }
  });
  return courseNames;
};

const findAndUpdateInstructorRole = async (name, guild, courseAdminRole) => {
  const oldInstructorRole = guild.roles.cache.find((role) => role.name !== name && role.name.includes(name));
  oldInstructorRole.setName(`${name} ${courseAdminRole}`);
};

const setCourseToPrivate = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.private = true;
    await course.save();
  }
};

const setCourseToPublic = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.private = false;
    await course.save();
  }
};

const createCourseToDatabase = async (courseCode, courseFullName, courseName, Course) => {
  const alreadyinuse = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (!alreadyinuse) {
    await Course.create({ code: courseCode, fullName: courseFullName, name: courseName, private: false });
  }
};

const removeCourseFromDb = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    await Course.destroy({
      where:
        { name: { [Sequelize.Op.iLike]: courseName } },
    });
  }
};

const findCourseFromDb = async (courseName, Course) => {
  return await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
};

const findCoursesFromDb = async (order, Course, state) => {
  const filter = {
    true: { private: true },
    false: { private: false },
    undefined: {},
  };
  return await Course.findAll({
    attributes: ["code", "fullName", "name", "id"],
    order: [order],
    where: filter[state],
    raw: true,
  });
};

const findCourseFromDbWithFullName = async (courseFullName, Course) => {
  return await Course.findOne({
    where: {
      fullName: { [Sequelize.Op.iLike]: courseFullName },
    },
  });
};

const findCourseNickNameFromDbWithCourseCode = async (courseName, Course) => {
  return await Course.findOne({
    where: {
      code: { [Sequelize.Op.iLike]: courseName },
    },
  });
};

const findChannelFromDbByName = async (channelName, Channel) => {
  return await Channel.findOne({
    where: {
      name: channelName,
    },
  });
};

const createChannelToDatabase = async (courseId, channelName, Channel) => {
  const alreadyinuse = await Channel.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: channelName } },
  });
  if (!alreadyinuse) {
    await Channel.create({ name: channelName, courseId: courseId });
  }
};

const removeChannelFromDb = async (channelName, Channel) => {
  const channel = await Channel.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: channelName } },
  });
  if (channel) {
    await Channel.destroy({
      where:
        { name: { [Sequelize.Op.iLike]: channelName } },
    });
  }
};

const findChannelsByCourse = async (id, Channel) => {
  return await Channel.findAll({
    where: {
      courseId: id,
    },
  });
};


module.exports = {
  createCategoryName,
  createPrivateCategoryName,
  getRoleFromCategory,
  findOrCreateRoleWithName,
  updateGuideMessage,
  updateGuide,
  createInvitation,
  findCategoryName,
  findChannelWithNameAndType,
  findChannelWithId,
  msToMinutesAndSeconds,
  checkCourseCooldown,
  handleCooldown,
  createCourseInvitationLink,
  findOrCreateChannel,
  setCoursePositionABC,
  deleteCommand,
  isACourseCategory,
  trimCourseName,
  findAllCourseNames,
  findAndUpdateInstructorRole,
  setCourseToPrivate,
  setCourseToPublic,
  createCourseToDatabase,
  removeCourseFromDb,
  findCourseFromDb,
  findCourseFromDbWithFullName,
  findCoursesFromDb,
  findCourseNickNameFromDbWithCourseCode,
  findChannelFromDbByName,
  createChannelToDatabase,
  removeChannelFromDb,
  findChannelsByCourse,
};
