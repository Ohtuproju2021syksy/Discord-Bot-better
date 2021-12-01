const { findChannelFromDbByName, createChannelToDatabase, createDefaultChannelsToDatabase, removeChannelFromDb, findChannelsByCourse, countChannelsByCourse, editChannelNames, saveChannelTopicToDb } = require("../../../src/db/services/channelService");

const channelModelInstanceMock = {
  id: 1,
  courseId: 3,
  name: "discotg_general",
  topic: null,
  bridged: false,
  defaultChannel: true,
  voiceChannel: false,
  save: jest.fn(),
};

const channelModelMock = {
  findOne: jest.fn().mockResolvedValue(channelModelInstanceMock),
  update: jest.fn().mockResolvedValue(channelModelInstanceMock),
  destroy: jest.fn().mockResolvedValue(channelModelInstanceMock),
  create: jest.fn().mockResolvedValue(channelModelInstanceMock),
  bulkCreate: jest.fn().mockResolvedValue(channelModelInstanceMock),
  findAll: jest.fn().mockResolvedValue([channelModelInstanceMock]),
  count: jest.fn().mockResolvedValue([channelModelInstanceMock]),
};

const getDefaultChannelObjects = (courseName) => {
  courseName = courseName.replace(/ /g, "-");

  return [
    {
      name: `${courseName}_announcement`,
      type: "GUILD_TEXT",
    },
    {
      name: `${courseName}_general`,
      type: "GUILD_TEXT",
    },
    {
      name: `${courseName}_voice`,
      type: "GUILD_VOICE",
    },
  ];
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("channelService", () => {

  test("find channel from db by name", async () => {
    await findChannelFromDbByName("discotg_general", channelModelMock);
    expect(channelModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(channelModelMock.findOne).toHaveBeenCalledWith({
      where: {
        name: "discotg_general",
      },
    });
  });

  test("create a channel to database", async () => {
    const attributes = {
      courseId: 2,
      name: "kurssi_uusi",
      defaultChannel: false,
      voiceChannel: false,
    };
    channelModelMock.findOne.mockResolvedValueOnce(null);
    await createChannelToDatabase(attributes, channelModelMock);
    expect(channelModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(channelModelMock.create).toHaveBeenCalledTimes(1);
    expect(channelModelMock.create).toHaveBeenCalledWith(attributes);
  });

  test("create a channel to database won't save if already exists", async () => {
    const attributes = {
      courseId: 2,
      name: "kurssi_uusi",
      defaultChannel: false,
      voiceChannel: false,
    };
    await createChannelToDatabase(attributes, channelModelMock);
    expect(channelModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(channelModelMock.create).toHaveBeenCalledTimes(0);
  });

  test("create default channels", async () => {
    const channelObjects = getDefaultChannelObjects("testi2");
    const defaultChannelObjects = channelObjects.map(channelObject => {
      const voiceChannel = channelObject.type === "GUILD_VOICE";
      return {
        courseId: 4,
        name: channelObject.name,
        defaultChannel: true,
        voiceChannel: voiceChannel,
      };
    });
    await createDefaultChannelsToDatabase(defaultChannelObjects, channelModelMock);
    expect(channelModelMock.bulkCreate).toHaveBeenCalledTimes(1);
    expect(channelModelMock.bulkCreate).toHaveBeenCalledWith(defaultChannelObjects);
  });

  test("remove a channel from database", async () => {
    await removeChannelFromDb("discotg_general", channelModelMock);
    expect(channelModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(channelModelMock.destroy).toHaveBeenCalledTimes(1);
    expect(channelModelMock.destroy).toHaveBeenCalledWith({
      where:
        { name: "discotg_general" },
    });
  });

  test("remove a channel from database won't do anything if channel doesn't exist", async () => {
    channelModelMock.findOne.mockResolvedValueOnce(null);
    await removeChannelFromDb("discotg_general", channelModelMock);
    expect(channelModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(channelModelMock.destroy).toHaveBeenCalledTimes(0);
  });

  test("find all channels by course id", async () => {
    await findChannelsByCourse(3, channelModelMock);
    expect(channelModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(channelModelMock.findAll).toHaveBeenCalledWith({
      where:
        { courseId: 3 },
    });
  });

  test("get count of channels on course", async () => {
    await countChannelsByCourse(3, channelModelMock);
    expect(channelModelMock.count).toHaveBeenCalledTimes(1);
    expect(channelModelMock.count).toHaveBeenCalledWith({
      where:
        { courseId: 3 },
    });
  });

  test("change all channel names", async () => {
    await editChannelNames(3, "discotg", "tgdisco", channelModelMock);
    expect(channelModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(channelModelMock.findAll).toHaveBeenCalledWith({
      where:
        { courseId: 3 },
    });
    expect(channelModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(channelModelInstanceMock.name).toBe("tgdisco_general");
  });

  test("save channel topic to database", async () => {
    await saveChannelTopicToDb("discotg_general", "topic of the chat", channelModelMock);
    expect(channelModelMock.update).toHaveBeenCalledTimes(1);
    expect(channelModelMock.update).toHaveBeenCalledWith(
      { topic: "topic of the chat" },
      { where: { name: "discotg_general" } },
    );
  });

});