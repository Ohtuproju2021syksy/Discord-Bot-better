require("dotenv").config();
const { execute } = require("../../src/discordBot/events/message");
const sort = require("../../src/discordBot/commands/admin/sortCourses");
const deleteCommand = require("../../src/discordBot/commands/admin/deleteCommand");
const { messageInGuideChannel, messageInCommandsChannel, student } = require("../mocks/mockMessages");

jest.mock("../../src/discordBot/commands/admin/sortCourses");
jest.mock("../../src/discordBot/commands/admin/deleteCommand");

const prefix = process.env.PREFIX;

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix commands", () => {
  test("commands cannot be used in guide channel", async () => {
    messageInGuideChannel.content = `${prefix}sort`;
    const client = messageInGuideChannel.client;
    await execute(messageInGuideChannel, client);
    expect(messageInGuideChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("invalid command in commands channel does nothing", async () => {
    messageInCommandsChannel.content = `${prefix}join test`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("valid command in commands channel is executed", async () => {
    messageInCommandsChannel.content = `${prefix}sort`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(sort.execute).toHaveBeenCalledTimes(1);
  });

  test("invalid use of command sends correct message", async () => {
    messageInCommandsChannel.content = `${prefix}deletecommand`;
    const response = `You didn't provide any arguments, ${messageInCommandsChannel.author}!`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledWith(response);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(deleteCommand.execute).toHaveBeenCalledTimes(0);
  });

  test("if no command role do nothing", async () => {
    messageInCommandsChannel.content = `${prefix}sort`;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });
});