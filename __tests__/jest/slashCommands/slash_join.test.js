const { execute } = require("../../../src/discordBot/commands/student/join");
const { editEphemeral, editErrorEphemeral, sendEphemeral, sendReplyMessage } = require("../../../src/discordBot/services/message");
const { updateGuide, findCourseFromDb } = require("../../../src/db/services/courseService");
const { findUserByDiscordId } = require("../../../src/db/services/userService");
const { messageInCommandsChannel, student } = require("../../mocks/mockMessages");
const joinedUsersCounter = require("../../../src/promMetrics/joinedUsersCounter");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/userService");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/courseMemberService");

const counterSpy = jest.spyOn(joinedUsersCounter, "inc");

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../../mocks/mockInteraction");
const roleString = "tester";
const initialResponse = "Joining course...";

const course = { name: "tester", fullName: "test course", code: "101", private: false };
findCourseFromDb.mockImplementation((role) => role === course.name ? course : undefined);

const user = { name: "test", id: 1 };
findUserByDiscordId.mockImplementation(() => user);

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
    await execute(defaultTeacherInteraction, client, models);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You have been added to the ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(counterSpy).toHaveBeenCalledTimes(1);
    expect(counterSpy).toHaveBeenCalledWith({ course: roleString });
  });

  test("join to course twice, role added only ones and second time responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    member.roles.cache.push({ name: "tester" });
    await execute(defaultTeacherInteraction, client, models);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You are already on the ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("trying to join invalid course responds with correct ephemeral", async () => {
    const response = "Invalid course name: invalid";
    const client = defaultStudentInteraction.client;
    const member = client.guild.members.cache.get(defaultStudentInteraction.member.user.id);
    await execute(defaultStudentInteraction, client, models);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("copypasted join command works", async () => {
    messageInCommandsChannel.content = "/join test";
    messageInCommandsChannel.member = student;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.roleString = "tester";
    const member = client.guild.members.cache.get(messageInCommandsChannel.member.user.id);
    await execute(messageInCommandsChannel, client, models);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendReplyMessage).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(counterSpy).toHaveBeenCalledTimes(1);
    const joinedCourse = messageInCommandsChannel.roleString;
    expect(counterSpy).toHaveBeenCalledWith({ course: joinedCourse });
  });

  test("invalid course name copypasted returns error", async () => {
    messageInCommandsChannel.content = "/join invalid";
    messageInCommandsChannel.member = student;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.roleString = "invalid";
    const member = client.guild.members.cache.get(messageInCommandsChannel.member.user.id);
    await execute(messageInCommandsChannel, client, models);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendReplyMessage).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(0);
    expect(counterSpy).toHaveBeenCalledTimes(0);
  });
});