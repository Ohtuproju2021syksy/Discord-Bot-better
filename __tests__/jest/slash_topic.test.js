const { execute } = require("../../src/discordBot/commands/faculty/topic");
const { sendEphemeral, sendErrorEphemeral } = require("../../src/discordBot/services/message");
const {
  trimCourseName,
  handleCooldown,
  msToMinutesAndSeconds } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const time = "15:00";

msToMinutesAndSeconds.mockImplementation(() => time);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const newTopic = "New topic!";
defaultTeacherInteraction.options = { getString: jest.fn(() => newTopic) };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash topic command", () => {
  test("command must be used in course channels", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "This is not a course category, can not execute the command!";
    await execute(defaultTeacherInteraction, client);
    expect(handleCooldown).toHaveBeenCalledTimes(0);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("command can be used in course channel", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const channel = client.guild.channels.cache.get(2);
    const general = client.guild.channels.cache.get(3);
    const accouncement = client.guild.channels.cache.get(5);
    const response = "Channel topic has been changed";
    await execute(defaultTeacherInteraction, client);
    expect(trimCourseName).toHaveBeenCalledTimes(1);
    expect(trimCourseName).toHaveBeenCalledWith(channel.parent, client.guild);
    expect(general.setTopic).toHaveBeenCalledTimes(1);
    expect(general.setTopic).toHaveBeenCalledWith(newTopic);
    expect(accouncement.setTopic).toHaveBeenCalledTimes(1);
    expect(accouncement.setTopic).toHaveBeenCalledWith(newTopic);
    expect(handleCooldown).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("command has cooldown", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Command cooldown [mm:ss]: you need to wait ${time}!`;
    await execute(defaultTeacherInteraction, client);
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(2);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});