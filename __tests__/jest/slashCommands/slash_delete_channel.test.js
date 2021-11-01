const { execute } = require("../../../src/discordBot/commands/faculty/delete_channel");
const { sendEphemeral, editEphemeral, editErrorEphemeral, confirmChoice } = require("../../../src/discordBot/services/message");
const { removeChannelFromDb } = require("../../../src/db/services/channelService");
const { getCourseNameFromCategory, isCourseCategory } = require("../../../src/discordBot/services/service");


jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/db/services/channelService");

const models = require("../../mocks/mockModels");
const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
defaultTeacherInteraction.options = { getString: jest.fn((name) => name) };

const initialResponse = "Deleting text channel...";

jest.mock("../../../src/discordBot/services/service");
confirmChoice.mockImplementation(() => true);
getCourseNameFromCategory.mockImplementation((name) => name.replace("📚", "").trim());

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash delete_channel", () => {
  test("Command cannot be used in normal channel", async () => {
    const courseName = "guide";
    const response = "This command can be used only in course channels";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Command can be used only in course channels", async () => {
    const courseName = "guide";
    const response = "This command can be used only in course channels";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 4;
    const client = defaultTeacherInteraction.client;
    client.guild.channels.create("notcourse", "GUILD_CATEGORY");
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Originals cannot be deleted", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const courseName = "general";
    const response = "Original channels can not be deleted.";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Invalid channel cannot be deleted", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const courseName = "invalid";
    const response = "There is no added channel with given name.";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Valid channel can be deleted", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const courseName = "test";
    const response = `${courseName} deleted!`;
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(removeChannelFromDb).toHaveBeenCalledTimes(1);
    expect(removeChannelFromDb).toHaveBeenCalledWith(`${courseName}_${courseName}`, models.Channel);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
