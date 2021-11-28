const { execute } = require("../../../src/discordBot/commands/faculty/edit_topic");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../../src/discordBot/services/message");
const { confirmChoice } = require("../../../src/discordBot/services/confirm");
const { saveChannelTopicToDb } = require("../../../src/db/services/channelService");
const {
  getCourseNameFromCategory,
  handleCooldown,
  msToMinutesAndSeconds,
  checkCourseCooldown,
  isCourseCategory } = require("../../../src/discordBot/services/service");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/confirm");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/channelService");
jest.mock("../../../src/db/services/courseService");

const models = require("../../mocks/mockModels");

const time = "4:59";
const initialResponse = "Editing topic...";

msToMinutesAndSeconds.mockImplementation(() => time);
confirmChoice.mockImplementation(() => true);

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
const newTopic = "New topic!";
defaultTeacherInteraction.options = { getString: jest.fn(() => newTopic) };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash edit_topic command", () => {
  test("command must be used in course channels", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "This is not a course category, can not execute the command!";
    await execute(defaultTeacherInteraction, client, models);
    expect(handleCooldown).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("command can be used in course channel", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const channel = client.guild.channels.cache.get(2);
    const general = client.guild.channels.cache.get(3);
    const response = "Channel topic has been changed";
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(getCourseNameFromCategory).toHaveBeenCalledTimes(2);
    expect(getCourseNameFromCategory).toHaveBeenCalledWith(channel.parent, client.guild);
    expect(general.setTopic).toHaveBeenCalledTimes(1);
    expect(general.setTopic).toHaveBeenCalledWith(newTopic);
    expect(saveChannelTopicToDb).toHaveBeenCalledTimes(1);
    expect(saveChannelTopicToDb).toHaveBeenCalledWith(getCourseNameFromCategory(general.name), newTopic, models.Channel);
    expect(handleCooldown).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("command has cooldown", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    checkCourseCooldown.mockImplementation(() => time);
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Command cooldown [mm:ss]: you need to wait ${time}!`;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});