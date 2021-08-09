const { execute } = require("../../src/discordBot/events/message");
const { messageInGuideChannel, messageInCommandsChannel, student } = require("../mocks/mockMessages");

jest.mock("../../src/discordBot/commands/admin/deleteCommand");
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
    messageInGuideChannel.content = "!sort";
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

  test("Invalid use of command - no arguments", async () => {
    const msg = `You didn't provide any arguments, ${messageInCommandsChannel.author}!`;
    messageInCommandsChannel.content = "!deletecommand";
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, Groups);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledWith(msg);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
  });

  test("Valid use of command reacts with checkmark", async () => {
    messageInCommandsChannel.content = "!deletecommand help";
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, Groups);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
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