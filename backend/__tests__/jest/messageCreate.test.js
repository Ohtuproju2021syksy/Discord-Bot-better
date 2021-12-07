require("dotenv").config();
const { execute } = require("../../src/discordBot/events/messageCreate");
const { execute: joinCommand } = require("../../src/discordBot/commands/student/join");
const sort = require("../../src/discordBot/commands/admin/sort_courses");
const delete_command = require("../../src/discordBot/commands/admin/delete_command");
const delete_course = require("../../src/discordBot/commands/admin/delete_course");
const { sendReplyMessage } = require("../../src/discordBot/services/message");
const { findCourseFromDb } = require("../../src/db/services/courseService");
const { messageInGuideChannel, messageInCommandsChannel, student, teacher } = require("../mocks/mockMessages");
const models = require("../mocks/mockModels");

jest.mock("../../src/discordBot/commands/admin/sort_courses");
jest.mock("../../src/discordBot/commands/admin/delete_command");
jest.mock("../../src/discordBot/commands/admin/delete_course");
jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");
jest.mock("../../src/db/services/courseService");
jest.mock("../../src/db/services/userService");
jest.mock("../../src/discordBot/commands/student/join", () => {
  const originalModule = jest.requireActual("../../src/discordBot/commands/student/join");

  return {
    ...originalModule,
    execute: jest.fn().mockImplementation(() => true),
  };
});

const prefix = process.env.PREFIX;

const course = { name: "test", fullName: "test course", code: "101", private: false };
findCourseFromDb.mockImplementation(() => course);

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
    messageInCommandsChannel.content = `${prefix}invalid test`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("copypasted join command is executed", async () => {
    messageInCommandsChannel.content = "/join test";
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, models);
    expect(joinCommand).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("valid command in commands channel is executed", async () => {
    messageInCommandsChannel.content = `${prefix}sort_courses`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client, models);
    expect(sort.execute).toHaveBeenCalledTimes(1);
  });

  test("invalid use of command sends correct message", async () => {
    messageInCommandsChannel.content = `${prefix}delete_command`;
    const msg = `You didn't provide any arguments, ${messageInCommandsChannel.author}!`;
    const response = { content: msg, reply: { messageReference: messageInCommandsChannel.id } };
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledWith(response);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(delete_command.execute).toHaveBeenCalledTimes(0);
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

  test("if command has emit parameter call client emit", async () => {
    messageInCommandsChannel.content = `${prefix}delete_course test`;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = teacher;
    messageInCommandsChannel.member = teacher;
    await execute(messageInCommandsChannel, client, models);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(delete_course.execute).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.react).toHaveBeenCalledWith("✅");
    expect(client.emit).toHaveBeenCalledTimes(1);
  });
});

describe("Unknown slash commands", () => {
  test("unknown slash command is met with correct response", async () => {
    messageInCommandsChannel.content = "/unvalidCommand";
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(sendReplyMessage).toHaveBeenCalledTimes(1);
  });
});
