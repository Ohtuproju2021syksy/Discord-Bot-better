const { Sequelize } = require("sequelize");
const { findOrCreateChannel, getChannelObject, findCategoryWithCourseName } = require("../../discordBot/services/service");

const findChannelFromDbByName = async (channelName, Channel) => {
  return await Channel.findOne({
    where: {
      name: channelName,
    },
  });
};

const createChannelToDatabase = async (channelAttributes, Channel) => {
  const alreadyinuse = await Channel.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: channelAttributes.name } },
  });
  if (!alreadyinuse) {
    await Channel.create(channelAttributes);
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
        { name: channelName },
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

const countChannelsByCourse = async (id, Channel) => {
  return await Channel.count({
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

const saveChannelTopicToDb = async (channelName, newTopic, Channel) => {
  await Channel.update(
    { topic: newTopic },
    { where: { name: channelName } });
};

const initChannelHooks = (guild, Channel) => {
  Channel.addHook("afterBulkDestroy", (channel) => {
    guild.channels.cache.find(c => c.name === channel.where.name)?.delete();
  });

  Channel.addHook("afterCreate", async (channel) => {
    if (!channel.defaultChannel) {
      const params = channel.name.split("_");
      const courseName = params[0];
      const channelName = params.slice(1).join("_");

      const category = findCategoryWithCourseName(courseName, guild);
      const channelObject = getChannelObject(courseName, channelName, category);

      await findOrCreateChannel(channelObject, guild);
    }
  });
};

module.exports = {
  findChannelFromDbByName,
  createChannelToDatabase,
  removeChannelFromDb,
  findChannelsByCourse,
  countChannelsByCourse,
  editChannelNames,
  saveChannelTopicToDb,
  initChannelHooks,
};