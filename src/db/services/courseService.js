const { findChannelWithNameAndType, getCourseNameFromCategory } = require("../../discordBot/services/service");
const { Sequelize } = require("sequelize");
const GUIDE_CHANNEL_NAME = "guide";

let invite_url = "";

process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

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
    category.permissionOverwrites.create(guild.roles.cache.find(r => r.name.toLowerCase().includes(courseName.toLowerCase())), { VIEW_CHANNEL: true, SEND_MESSAGES: false });
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
    return await Course.create({ code: courseCode, fullName: courseFullName, name: courseName, private: false });
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

const isCourseCategory = async (channel, Course) => {
  if (channel && channel.name) {
    const course = await findCourseFromDb(getCourseNameFromCategory(channel.name), Course);
    return course ? true : false;
  }
};

const findAllCourseNames = async (guild, Course) => {
  const courseNames = [];
  const channels = guild.channels.cache;
  for (const c of channels) {
    if (await isCourseCategory(c, Course)) {
      courseNames.push(getCourseNameFromCategory(channel));
    }
  };
  return courseNames;
};

module.exports = {
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
  updateGuide,
  updateGuideMessage,
  isCourseCategory,
  findAllCourseNames,
};