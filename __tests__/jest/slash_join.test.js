const { execute } = require("../../src/discordBot/commands/student/join");
const { sendErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");
const { updateGuide, findCourseFromDb } = require("../../src/discordBot/services/service");
const { messageInCommandsChannel, student } = require("../mocks/mockMessages");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../mocks/mockInteraction");
const roleString = "tester";

const course = { name: "tester", fullName: "test course", code: "101", private: false };
findCourseFromDb.mockImplementation((role, cour) => role === course.name ? course : undefined);

defaultTeacherInteraction.options = { getString: jest.fn(() => roleString) };
defaultStudentInteraction.options = { getString: jest.fn(() => "invalid") };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash join command", () => {
  test("join to valid course adds role and responds with correct epheremal", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: roleString });
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You have been added to a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("join to course twice, role added only ones and second time responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    member.roles.cache.push({ name: "tester" });
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You are already on a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("trying to join invalid course responds with correct ephemeral", async () => {
    const response = "Invalid course name: invalid";
    const client = defaultStudentInteraction.client;
    const member = client.guild.members.cache.get(defaultStudentInteraction.member.user.id);
    await execute(defaultStudentInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("copypasted join command works", async () => {
    messageInCommandsChannel.content = "/join test";
    messageInCommandsChannel.member = student;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.roleString = "tester";
    const member = client.guild.members.cache.get(messageInCommandsChannel.member.user.id);
    await execute(messageInCommandsChannel, client);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("invalid course name copypasted returns error", async () => {
    messageInCommandsChannel.content = "/join invalid";
    messageInCommandsChannel.member = student;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.roleString = "invalid";
    const member = client.guild.members.cache.get(messageInCommandsChannel.member.user.id);
    await execute(messageInCommandsChannel, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});