const {
  findOrCreateChannel,
  getChannelObject,
  findCategoryWithCourseName,
  getDefaultChannelObjects } = require("../discordBot/services/service");
const { findCourseFromDbById } = require("./services/courseService");

const initHooks = (guild, models) => {
  initChannelHooks(guild, models);
};

const initChannelHooks = (guild, { Channel, Course }) => {
  Channel.addHook("afterBulkDestroy", (channel) => {
    guild.channels.cache.find(c => c.name === channel.where.name)?.delete();
  });

  Channel.addHook("afterCreate", async (channel) => {
    const course = await findCourseFromDbById(channel.courseId, Course);
    const channelName = channel.name.replace(`${course.name}_`, "");

    if (!channel.defaultChannel) {
      const category = findCategoryWithCourseName(course.name, guild);
      const channelObject = getChannelObject(course.name, channelName, category);

      await findOrCreateChannel(channelObject, guild);
    }
  });

  Channel.addHook("afterBulkCreate", async (channel) => {
    const course = await findCourseFromDbById(channel[0].courseId, Course);

    const channelObjects = await getDefaultChannelObjects(guild, course.name);
    await Promise.all(channelObjects.map(
      async channelObject => await findOrCreateChannel(channelObject, guild),
    ));
  });
};

module.exports = { initHooks };