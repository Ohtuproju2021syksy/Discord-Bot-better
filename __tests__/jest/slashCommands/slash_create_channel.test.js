const { execute } = require("../../../src/discordBot/commands/faculty/create_channel");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { getCourseNameFromCategory } = require("../../../src/discordBot/services/service");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { createChannelToDatabase, countChannelsByCourse, findChannelFromDbByName } = require("../../../src/db/services/channelService");

const models = require("../../mocks/mockModels");
jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/channelService");

getCourseNameFromCategory.mockImplementation((name) => name.replace("📚", "").trim());

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
findCourseFromDb.mockImplementation((courseName) => ({ name: courseName, courseName: courseName, id: 1 }));
const courseName = "test";
const channelName = "rules";
const initialResponse = "Creating text channel...";
defaultTeacherInteraction.options = { getString: jest.fn(() => channelName) };

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
    findCourseFromDb.mockImplementationOnce(() => (null));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "This is not a course category, can not create new channel.";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Creation fails if another channel with same name exists", async () => {
    findChannelFromDbByName.mockImplementationOnce(() => true);
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "Channel with given name already exists";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("new channel can be created if course channel count is less or equal than 10", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Created new channel ${courseName}_${channelName}`;
    await execute(defaultTeacherInteraction, client, models);
    expect(findCourseFromDb).toHaveBeenCalledTimes(2);
    expect(createChannelToDatabase).toHaveBeenCalledTimes(1);
    expect(createChannelToDatabase).toHaveBeenCalledWith({ courseId: 1, name: `${courseName}_${channelName}` }, models.Channel);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("new channel cannot be created if course channel count is greater than 10", async () => {
    countChannelsByCourse.mockImplementationOnce(() => 13);
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = "Maximum added text channel amount is 10";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
