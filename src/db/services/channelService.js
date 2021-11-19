const { Sequelize } = require("sequelize");

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

const createDefaultChannelsToDatabase = async (channelObjects, Channel) => {
  await Channel.bulkCreate(channelObjects);
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

module.exports = {
  findChannelFromDbByName,
  createChannelToDatabase,
  removeChannelFromDb,
  findChannelsByCourse,
  countChannelsByCourse,
  editChannelNames,
  saveChannelTopicToDb,
  createDefaultChannelsToDatabase,
};