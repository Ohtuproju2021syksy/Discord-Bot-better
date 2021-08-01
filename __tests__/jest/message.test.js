const { execute } = require("../../src/discordBot/events/message");
const { messageInGuideChannel, messageInCommandsChannel, student } = require("../mocks/mockMessages");

jest.mock("../../src/discordBot/commands/admin/deleteCommand");
jest.mock("../../src/discordBot/commands/admin/sortCourses");
jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

afterEach(() => {
  jest.clearAllMocks();
});

const Groups = {
  create: jest.fn(),
  findOne: jest
    .fn(() => true)
    .mockImplementationOnce(() => false),
  destroy: jest.fn(),
};

describe("prefix commands", () => {
  test("commands cannot be used in guide channel", async () => {
    messageInGuideChannel.content = "!join test";
    const client = messageInGuideChannel.client;
    await execute(messageInGuideChannel, client, Groups);
    expect(messageInGuideChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("invalid command in commands channel does nothing", async () => {
    messageInCommandsChannel.content = "!join test";
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, Groups);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("command misuse sends corrent info ", async () => {
    messageInCommandsChannel.content = "!deletecommand";
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, Groups);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledWith(`You didn't provide any arguments, ${messageInCommandsChannel.author}!`);
  });

  test("valid commands can be used in commands channel", async () => {
    messageInCommandsChannel.content = "!sort";
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, Groups);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.react).toHaveBeenCalledWith("✅");
  });

  test("if no command role do nothing", async () => {
    messageInCommandsChannel.content = "!sort";
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel, client, Groups);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });
});