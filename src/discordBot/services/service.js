const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { logError } = require("./logger");
const { courseAdminRole } = require("../../../config.json");

require("dotenv").config();
const GUIDE_CHANNEL_NAME = "guide";

let invite_url = "";

process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

const cooldownMap = new Map();

const cooldownTimeMs = 1000 * 60 * 5;

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
  return `Invitation link for the course <${invite_url}/join/${courseName}>`;
};

const createInvitation = async (guild, args) => {
  const guide = guild.channels.cache.find(
    c => c.type === "GUILD_TEXT" && c.name === "guide",
  );
  const name = args;
  const category = guild.channels.cache.find(
    c => c.type === "GUILD_CATEGORY" && getCourseNameFromCategory(c.name.toLowerCase()) === name.toLowerCase(),
  );
  const course = guild.channels.cache.find(
    (c => c.parent === category),
  );
  let invitationlink;
  if (args === GUIDE_CHANNEL_NAME) {
    await guide.createInvite({ maxAge: 0, unique: true, reason: args });
    invitationlink = `Invitation link for the server <${invite_url}>`;
  }
  else {
    invitationlink = createCourseInvitationLink(args);
  }

  const message = await course.send(invitationlink);
  await message.pin();
};

const findCategoryWithCourseName = (courseString, guild) => {
  try {
    const category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && getCourseNameFromCategory(c.name.toLowerCase()) === courseString.toLowerCase());
    return category;
  }
  catch (error) {
    logError(error);
    // console.log(error);
  }
};

const findChannelWithNameAndType = (name, type, guild) => {
  return guild.channels.cache.find(c => c.type === type && getCourseNameFromCategory(c.name.toLowerCase()) === name.toLowerCase());
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

const getChannelObject = (roleName, channelName, category) => {
  roleName = roleName.replace(/ /g, "-");
  return {
    name: `${roleName}_${channelName}`,
    parent: category,
    options: { type: "GUILD_TEXT", parent: category, permissionOverwrites: [] },
  };
};

const findOrCreateChannel = async (channelObject, guild) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name.toLowerCase() === name.toLowerCase());
  if (alreadyExists) {
    if (options?.topic && alreadyExists.topic !== options.topic) {
      return await alreadyExists.setTopic(options.topic);
    }
    return alreadyExists;
  }
  return await guild.channels.create(name, options);
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

const emojiRegex = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi);

const containsEmojis = (text) => {
  const result = emojiRegex.test(text);
  emojiRegex.lastIndex = 0;
  return result;
};

const getCourseNameFromCategory = (category) => {
  let trimmedName = "";
  if (category.name) {
    trimmedName = category.name.replace(emojiRegex, "").trim();
  }
  else {
    trimmedName = category.replace(emojiRegex, "").trim();
  }
  return trimmedName;
};

const findAndUpdateInstructorRole = async (name, guild, adminRole) => {
  const oldInstructorRole = guild.roles.cache.find((role) => role.name !== name && role.name.includes(name));
  oldInstructorRole.setName(`${name} ${adminRole}`);
};

const downloadImage = async (course) => {
  const url = `http://95.216.219.139/grafana/render/d-solo/WpYTNiOnz/discord-dashboard?orgId=1&from=now-30d&to=now&var-course=${course}&panelId=2&width=1000&height=500&tz=Europe%2FHelsinki`;
  const directory = path.resolve(__dirname, "../../promMetrics/graph/");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const filepath = path.resolve(__dirname, directory, "graph.png");
  const writer = fs.createWriteStream(filepath);

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      headers: { "Authorization": `Bearer ${process.env.GRAFANA_TOKEN}` },
    });
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }
  catch (error) {
    logError(error);
    return;
  }
};

const listCourseInstructors = async (guild, roleString, adminRole) => {

  const facultyRole = await guild.roles.cache.find(r => r.name === "faculty");
  const instructorRole = await guild.roles.cache.find(r => r.name === `${roleString} ${adminRole}`);
  const members = await guild.members.fetch();
  let adminsString = "";
  members.forEach(m => {
    const roles = m._roles;
    if (roles.some(r => r === facultyRole.id) && roles.some(r => r === instructorRole.id)) {
      if (adminsString === "") {
        adminsString = "<@" + m.user.id + ">";
      }
      else {
        adminsString = adminsString + ", " + "<@" + m.user.id + ">";
      }
    }
  });

  members.forEach(m => {
    const roles = m._roles;
    if (!roles.some(r => r === facultyRole.id) && roles.some(r => r === instructorRole.id)) {
      if (adminsString === "") {
        adminsString = "<@" + m.user.id + ">";
      }
      else {
        adminsString = adminsString + ", " + "<@" + m.user.id + ">";
      }
    }
  });
  return adminsString;
};

const updateInviteLinks = async (guild, adminRole, facultyRole, client) => {
  const announcementChannels = guild.channels.cache.filter(c => c.name.includes("announcement"));
  await Promise.all(announcementChannels.map(async aChannel => {
    const pinnedMessages = await aChannel.messages.fetchPinned();
    const invMessage = pinnedMessages.find(msg => msg.author === client.user && msg.content.includes("Invitation link for"));
    const courseName = getCourseNameFromCategory(aChannel.parent);
    let updatedMsg = createCourseInvitationLink(courseName);
    const instructors = await listCourseInstructors(guild, courseName, adminRole, facultyRole);
    if (instructors !== "") {
      updatedMsg = updatedMsg + "\nInstructors for the course:" + instructors;
    }
    await invMessage.edit(updatedMsg);
  }));
};

const getCategoryChannelPermissionOverwrites = (guild, admin, student) => ([
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

const getDefaultChannelObjects = async (guild, courseName, student, admin, category) => {
  courseName = courseName.replace(/ /g, "-");

  return [
    {
      name: `${courseName}_announcement`,
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
      name: `${courseName}_general`,
      parent: category,
      options: { type: "GUILD_TEXT", parent: category, permissionOverwrites: [] },
    },
    {
      name: `${courseName}_voice`,
      parent: category,
      options: { type: "GUILD_VOICE", parent: category, permissionOverwrites: [] },
    },
  ];
};

const getCategoryObject = (categoryName, permissionOverwrites) => ({
  name: `📚 ${categoryName}`,
  options: {
    type: "GUILD_CATEGORY",
    permissionOverwrites,
  },
});

const getUserWithUserId = async (guild, userId) => {
  return await guild.members.cache.get(userId);
};

const changeCourseRoles = async (courseName, newValue, guild) => {
  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name === courseName))
    .map(async role => {
      if (role.name.includes("instructor")) {
        role.setName(`${newValue} instructor`);
      }
      else {
        role.setName(newValue);
      }
    },
    ));
};

const changeInvitationLink = async (channelAnnouncement) => {
  const pinnedMessages = await channelAnnouncement.messages.fetchPinned();
  const invMessage = pinnedMessages.find(msg => msg.author.bot && msg.content.includes("Invitation link for the course"));
  const courseName = channelAnnouncement.parent.name.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "").trim();
  const updatedMsg = createCourseInvitationLink(courseName);
  await invMessage.edit(updatedMsg);
};

const setEmojisLock = async (category, hidden, courseName) => {
  hidden ? await category.setName(`👻🔐 ${courseName}`) : await category.setName(`📚🔐 ${courseName}`);
};

const setEmojisUnlock = async (category, hidden, courseName) => {
  hidden ? await category.setName(`👻 ${courseName}`) : await category.setName(`📚 ${courseName}`);
};

const setEmojisHide = async (category, locked, courseName) => {
  locked ? await category.setName(`👻🔐 ${courseName}`) : await category.setName(`👻 ${courseName}`);
};

const setEmojisUnhide = async (category, locked, courseName) => {
  locked ? await category.setName(`📚🔐 ${courseName}`) : await category.setName(`📚 ${courseName}`);
};

module.exports = {
  findCategoryWithCourseName,
  findOrCreateRoleWithName,
  createInvitation,
  findChannelWithNameAndType,
  findChannelWithId,
  msToMinutesAndSeconds,
  checkCourseCooldown,
  handleCooldown,
  createCourseInvitationLink,
  findOrCreateChannel,
  deletecommand,
  getCourseNameFromCategory,
  findAndUpdateInstructorRole,
  listCourseInstructors,
  updateInviteLinks,
  downloadImage,
  containsEmojis,
  getUserWithUserId,
  getChannelObject,
  getCategoryChannelPermissionOverwrites,
  getDefaultChannelObjects,
  getCategoryObject,
  changeCourseRoles,
  changeInvitationLink,
  setEmojisLock,
  setEmojisUnlock,
  setEmojisHide,
  setEmojisUnhide,
};
