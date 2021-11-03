const { Sequelize } = require("sequelize");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

require("dotenv").config();
const GUIDE_CHANNEL_NAME = "guide";

let invite_url = "";

process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

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
      return `  - ${code} - ${fullname} 👤${count}`;
    });

  const newContent = `
Käytössäsi on seuraavia komentoja:
  - \`/join\` jolla voit liittyä kurssille
  - \`/leave\` jolla voit poistua kurssilta
Kirjoittamalla \`/join\` tai \`/leave\` botti antaa listan kursseista.

You have the following commands available:
  - \`/join\` which you can use to join a course
  - \`/leave\` which you can use to leave a course
The bot gives a list of the courses if you type \`/join\` or \`/leave\`.

Kurssit / Courses:
${rows.join("\n")}

In course specific channels you can also list instructors with the command \`/instructors\`

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
  return `Invitation link for the course <${invite_url}/join/${courseName}>`;
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
  if (channel && channel.name) {
    return emojiRegex.test(channel.name);
  }
  return false;
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

const findAllCourseNames = (guild) => {
  const courseNames = [];

  guild.channels.cache.forEach(channel => {
    if (isCourseCategory(channel)) {
      courseNames.push(getCourseNameFromCategory(channel));
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

const setCourseToLocked = async (courseName, Course, guild) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.locked = true;
    const category = findChannelWithNameAndType(courseName, "GUILD_CATEGORY", guild);
    category.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase() === courseName.toLowerCase()), { VIEW_CHANNEL: true, SEND_MESSAGES: false });
    category.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase() === `${courseName.toLowerCase()} instructor`), { VIEW_CHANNEL: true, SEND_MESSAGES: true });
    category.permissionOverwrites.create(guild.roles.cache.find(r => r.name === "faculty"), { SEND_MESSAGES: true });
    await course.save();
  }
};

const setCourseToUnlocked = async (courseName, Course, guild) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.locked = false;
    const category = findChannelWithNameAndType(courseName, "GUILD_CATEGORY", guild);
    category.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase().includes(courseName.toLowerCase())), { VIEW_CHANNEL: true, SEND_MESSAGES: true });
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
    attributes: ["code", "fullName", "name"],
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
      name: { [Sequelize.Op.iLike]: channelName },
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

const editChannelNames = async (courseId, previousCourseName, newCourseName, Channel) => {
  const channels = await findChannelsByCourse(courseId, Channel);
  channels.map(async (channel) => {
    const newChannelName = channel.name.replace(previousCourseName, newCourseName);
    channel.name = newChannelName;
    await channel.save();
  });
  await Promise.all(channels);
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
    return;
  }
};

const listCourseInstructors = async (guild, roleString, courseAdminRole) => {

  const facultyRole = await guild.roles.cache.find(r => r.name === "faculty");
  const instructorRole = await guild.roles.cache.find(r => r.name === `${roleString} ${courseAdminRole}`);
  const members = await guild.members.fetch();
  console.log("*********************");
  console.log(roleString);
  console.log("inst id " + instructorRole.id);
  let adminsString = "";
  members.forEach(m => {
    const roles = m._roles;
    if (roles.some(r => r === facultyRole.id) && roles.some(r => r === instructorRole.id)) {
      console.log("Löyty fac/ins " + m.user.id);
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
      console.log("Löyty ins " + m.user.id);
      if (adminsString === "") {
        adminsString = "<@" + m.user.id + ">";
      }
      else {
        adminsString = adminsString + ", " + "<@" + m.user.id + ">";
      }
    }
  });
  console.log(adminsString);
  return adminsString;
};

const updateInviteLinks = async (guild, courseAdminRole, facultyRole, client) => {
  const announcementChannels = guild.channels.cache.filter(c => c.name.includes("announcement"));
  announcementChannels.forEach(async aChannel => {
    const pinnedMessages = await aChannel.messages.fetchPinned();
    const invMessage = pinnedMessages.find(msg => msg.author === client.user && msg.content.includes("Invitation link for"));
    const courseName = getCourseNameFromCategory(aChannel.parent);
    let updatedMsg = createCourseInvitationLink(courseName);
    const instructors = await listCourseInstructors(guild, courseName, courseAdminRole, facultyRole);
    if (!instructors !== "") {
      updatedMsg = updatedMsg + "\nInstructors for the course:" + instructors;
    }
    await invMessage.edit(updatedMsg);
  });
};

module.exports = {
  findOrCreateRoleWithName,
  findCategoryWithCourseName,
  updateGuideMessage,
  updateGuide,
  createInvitation,
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
  getCourseNameFromCategory,
  findAllCourseNames,
  findAndUpdateInstructorRole,
  setCourseToPrivate,
  setCourseToPublic,
  setCourseToLocked,
  setCourseToUnlocked,
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
  getHiddenCourse,
  getLockedCourse,
  getPublicCourse,
  getUnlockedCourse,
  editChannelNames,
  listCourseInstructors,
  updateInviteLinks,
  downloadImage,
};
