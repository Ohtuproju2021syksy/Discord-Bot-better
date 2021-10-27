require("dotenv").config();
const GUIDE_CHANNEL_NAME = "guide";

let invite_url = "";

process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

const createCategoryName = (courseString) => `📚 ${courseString}`;

const createPrivateCategoryName = (courseString) => `👻 ${courseString}`;

const createLockedCategoryName = (courseString) => `🔐 ${courseString}`;

const getUnlockedCourse = (name, guild) => {
  return guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase().includes(name.toLowerCase()) && !c.name.toLowerCase().includes("🔐"));
};

const getLockedCourse = (name, guild) => {
  return guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase().includes(name.toLowerCase()) && c.name.toLowerCase().includes("🔐"));
};

const getHiddenCourse = (name, guild) => {
  return guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase().includes(name.toLowerCase()) && c.name.toLowerCase().includes("👻"));
};

const getPublicCourse = (name, guild) => {
  return guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase().includes(name.toLowerCase()) && !c.name.toLowerCase().includes("👻"));
};

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
    cleaned = categoryName.replace("👻", "").trim();
  }
  if (cleaned.includes("🔐")) {
    cleaned = cleaned.replace("🔐", "").trim();
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

const createCourseInvitationLink = (courseName) => {
  courseName = courseName.replace(/ /g, "%20").trim();
  return `Invitation link for the course ${invite_url}/join/${courseName}`;
};

const createInvitation = async (guild, args) => {
  const guide = guild.channels.cache.find(
    c => c.type === "GUILD_TEXT" && c.name === "guide",
  );
  const name = args;
  const category = guild.channels.cache.find(
    c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase().includes(name.toLowerCase()),
  );
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
  try {
    const category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.toLowerCase().includes(courseString.toLowerCase()));
    return category ? category.name : courseString;
  }
  catch (error) {
    // console.log(error);
  }
};

const findChannelWithNameAndType = (name, type, guild) => {
  return guild.channels.cache.find(c => c.type === type && c.name.toLowerCase().includes(name.toLowerCase()));
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
    (c) => c.type === options.type && c.name.toLowerCase().includes(name.toLowerCase()));
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

const deletecommand = async (client, commandToDeleteName) => {
  client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.get().then(commands => {
    commands.forEach(async command => {
      if (command.name === commandToDeleteName) {
        await client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands(command.id).delete();
      }
    });
  });
};

const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

const isCourseCategory = (channel) => {
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
    if (isCourseCategory(channel)) {
      courseNames.push(trimCourseName(channel));
    }
  });
  return courseNames;
};

const findAndUpdateInstructorRole = async (name, guild, courseAdminRole) => {
  const oldInstructorRole = guild.roles.cache.find((role) => role.name !== name && role.name.includes(name));
  oldInstructorRole.setName(`${name} ${courseAdminRole}`);
};

module.exports = {
  createCategoryName,
  createPrivateCategoryName,
  createLockedCategoryName,
  getRoleFromCategory,
  findOrCreateRoleWithName,
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
  deletecommand,
  isCourseCategory,
  trimCourseName,
  findAllCourseNames,
  findAndUpdateInstructorRole,
  getHiddenCourse,
  getLockedCourse,
  getPublicCourse,
  getUnlockedCourse,
};
