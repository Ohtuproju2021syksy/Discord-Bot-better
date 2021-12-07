const { execute } = require("../../../src/discordBot/commands/faculty/delete_channel");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../../src/discordBot/services/message");
const { confirmChoice } = require("../../../src/discordBot/services/confirm");
const { removeChannelFromDb, findChannelFromDbByName } = require("../../../src/db/services/channelService");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { getCourseNameFromCategory } = require("../../../src/discordBot/services/service");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/confirm");
jest.mock("../../../src/db/services/channelService");
jest.mock("../../../src/db/services/courseService");

const models = require("../../mocks/mockModels");
const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
defaultTeacherInteraction.options = { getString: jest.fn((name) => name) };

const initialResponse = "Deleting text channel...";

const parentChannel = {
  name: "test",
};

jest.mock("../../../src/discordBot/services/service");
confirmChoice.mockImplementation(() => true);
getCourseNameFromCategory.mockImplementation((name) => name.replace("📚", "").trim());
findCourseFromDb.mockImplementationOnce(() => false);
findCourseFromDb.mockImplementation(() => parentChannel);
findChannelFromDbByName.mockImplementationOnce(() => false);
findChannelFromDbByName.mockImplementation(() => true);


afterEach(() => {
  jest.clearAllMocks();
});

describe("slash delete_channel", () => {
  test("Command cannot be used in normal channel", async () => {
    const courseName = "guide";
    const response = "Course not found, can not delete channel.";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(removeChannelFromDb).toHaveBeenCalledTimes(0);
  });

  test("Command can be used only in course channels", async () => {
    const courseName = "guide";
    const response = "This command can be used only in course channels";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 4;
    const client = defaultTeacherInteraction.client;
    client.guild.channels.create("notcourse", "GUILD_CATEGORY");
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(removeChannelFromDb).toHaveBeenCalledTimes(0);
  });

  test("Originals cannot be deleted", async () => {
    const courseName = "general";
    const response = "Original channels can not be deleted.";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(removeChannelFromDb).toHaveBeenCalledTimes(0);
  });

  test("Invalid channel cannot be deleted", async () => {
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
    expect(removeChannelFromDb).toHaveBeenCalledTimes(0);
  });

  test("Valid channel can be deleted", async () => {
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

  test("Command can be declined", async () => {
    confirmChoice.mockImplementation(() => false);
    const courseName = "test";
    const response = "Command declined";
    defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
    defaultTeacherInteraction.channelId = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(removeChannelFromDb).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
