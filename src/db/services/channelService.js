const { Sequelize } = require("sequelize");

const findChannelFromDbByName = async (channelName, Channel) => {
  return await Channel.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: channelName } },
  });
};

const findChannelFromDbByDiscordId = async (discordId, Channel) => {
  return await Channel.findOne({
    where:
      { discordId:  discordId },
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

const getAllChannels = async (Channel) => {
  return await Channel.findAll({
    attributes: ["id", "courseId", "name", "topic", "defaultChannel", "voiceChannel", "discordId"],
    raw: true,
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
  const channel = await findChannelFromDbByName(channelName, Channel);

  if (channel) {
    channel.topic = newTopic;
    await channel.save();
  }
};

const editChannelName = async (discordId, newName, Channel) => {
  const channel = await findChannelFromDbByDiscordId(discordId, Channel);

  if (channel) {
    channel.name = newName;
    await channel.save();
  }
};


const getChannelByDiscordId = async (id, Channel) => {
  return await Channel.findOne({
    where:
      { discordId: id },
  });
};


const saveChannelIdWithName = async (id, channelName, Channel) => {
  await Channel.update(
    { discordId: id },
    { where: { name: channelName } });
};

module.exports = {
  findChannelFromDbByName,
  findChannelFromDbByDiscordId,
  createChannelToDatabase,
  removeChannelFromDb,
  findChannelsByCourse,
  countChannelsByCourse,
  editChannelNames,
  createDefaultChannelsToDatabase,
  getChannelByDiscordId,
  saveChannelIdWithName,
  getAllChannels,
  editChannelName,
  saveChannelTopicToDb,
};