const { execute } = require("../../../src/discordBot/commands/faculty/create_channel");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { getCourseNameFromCategory, findCourseFromDb, createChannelToDatabase, isCourseCategory } = require("../../../src/discordBot/services/service");

const models = require("../../mocks/mockModels");
jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");

getCourseNameFromCategory.mockImplementation((name) => name.replace("📚", "").trim());

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
findCourseFromDb.mockImplementation((courseName) => ({ courseName: courseName, id: 1 }));
const courseName = "test";
const channelName = "rules";
const initialResponse = "Creating text channel...";
defaultTeacherInteraction.options = { getString: jest.fn(() => channelName) };

const setMaxChannels = (client) => {
  const category = client.guild.channels.cache.get(2).parent;
  for (let i = 3; i < 15; i++) {
    const channelToCreate = {
      name: i,
      parent: category,
      type: "GUILD_TEXT",
    };
    client.guild.channels.cache.set(i, channelToCreate);
  }
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash create channel command", () => {
  test("Cannot use command if channel has no parent", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course not found, can not create new channel.";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Cannot use command if channel is not course channel", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "This is not a course category, can not create new channel.";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("new channel can be created if course channel count is less or equal than 10", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Created new channel ${courseName}_${channelName}`;
    await execute(defaultTeacherInteraction, client, models);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(createChannelToDatabase).toHaveBeenCalledTimes(1);
    expect(createChannelToDatabase).toHaveBeenCalledWith(1, `${courseName}_${channelName}`, models.Channel);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("new channel cannot be created if course channel count is greater than 10", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    setMaxChannels(client);
    const response = "Maximum added text channel amount is 10";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
