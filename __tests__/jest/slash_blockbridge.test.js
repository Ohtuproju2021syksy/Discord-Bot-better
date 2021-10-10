const { execute } = require("../../src/discordBot/commands/faculty/blockbridge");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");
const { findChannelFromDbByName, findCourseFromDb } = require("../../src/discordBot/services/service");

const models = require("../mocks/mockModels");
jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const initalResponse = "Blocking the bridge to Telegram...";
const channelModelInstanceMock = { save: jest.fn(), bridged: true };

findChannelFromDbByName
  .mockImplementation(() => ({ bridged: false }))
  .mockImplementationOnce(() => null)
  .mockImplementationOnce(() => channelModelInstanceMock);

findCourseFromDb.mockImplementation(() => ({ telegramId: 1 }));

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash blockbridge command", () => {
  test("Cannot use command on non-course channels", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "This is not a course category, can not execute the command!";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Cannot use command on default course channels", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const response = "command can't be performed on default course channels!";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Correct channel can be blocked", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const response = "The bridge between this channel and Telegram is now blocked.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Blocking a channel that is already blocked responds with correct error ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const response = "The bridge is already blocked.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});