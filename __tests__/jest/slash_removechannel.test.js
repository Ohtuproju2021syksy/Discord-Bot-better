const { execute } = require("../../src/discordBot/commands/faculty/removechannel");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../src/discordBot/services/message");
const {
  removeChannelFromDb, getRoleFromCategory } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");

const models = require("../mocks/mockModels");
const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
defaultTeacherInteraction.options = { getString: jest.fn((name) => name) };

const initialResponse = "Removing text channel...";

jest.mock("../../src/discordBot/services/service");
getRoleFromCategory.mockImplementation((name) => name.replace("📚", "").trim());
removeChannelFromDb.mockImplementation(() => null);

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash removechannel", () => {
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

  test("Orginals cannot be removed", async () => {
    const courseName = "general";
    const response = "Original channels can not be removed.";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Invalid channel cannot be removed", async () => {
    const courseName = "invalid";
    const response = "There is no added channel with given name.";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Valid channel can be removed", async () => {
    const courseName = "test";
    const response = `${courseName} removed!`;
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});