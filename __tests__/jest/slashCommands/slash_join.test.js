const { execute } = require("../../../src/discordBot/commands/student/join");
const { editEphemeral, editErrorEphemeral, sendEphemeral, sendReplyMessage } = require("../../../src/discordBot/services/message");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { findUserByDiscordId } = require("../../../src/db/services/userService");
const { createCourseMemberToDatabase, findAllCourseMembersByUser } = require("../../../src/db/services/courseMemberService");
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

const course = { id: 1, name: "tester", fullName: "test course", code: "101", private: false };
findCourseFromDb.mockImplementation((role) => role === course.name ? course : undefined);

const user = { name: "test", id: 1 };
findUserByDiscordId.mockImplementation(() => user);

findAllCourseMembersByUser.mockImplementation(() => []);

defaultTeacherInteraction.options = { getString: jest.fn(() => roleString) };
defaultStudentInteraction.options = { getString: jest.fn(() => "invalid") };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash join command", () => {
  test("join to valid course adds role and responds with correct epheremal", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: roleString });
    await execute(defaultTeacherInteraction, client, models);
    expect(createCourseMemberToDatabase).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You have been added to the ${roleString} course.`);
    expect(counterSpy).toHaveBeenCalledTimes(1);
    expect(counterSpy).toHaveBeenCalledWith({ course: roleString });
  });

  test("trying to join invalid course responds with correct ephemeral", async () => {
    const response = "Invalid course name: invalid";
    const client = defaultStudentInteraction.client;
    await execute(defaultStudentInteraction, client, models);
    expect(createCourseMemberToDatabase).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("copypasted join command works", async () => {
    messageInCommandsChannel.content = "/join test";
    messageInCommandsChannel.member = student;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.roleString = "tester";
    await execute(messageInCommandsChannel, client, models);
    expect(createCourseMemberToDatabase).toHaveBeenCalledTimes(1);
    expect(sendReplyMessage).toHaveBeenCalledTimes(1);
    expect(counterSpy).toHaveBeenCalledTimes(1);
    const joinedCourse = messageInCommandsChannel.roleString;
    expect(counterSpy).toHaveBeenCalledWith({ course: joinedCourse });
  });

  test("invalid course name copypasted returns error", async () => {
    messageInCommandsChannel.content = "/join invalid";
    messageInCommandsChannel.member = student;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.roleString = "invalid";
    await execute(messageInCommandsChannel, client, models);
    expect(createCourseMemberToDatabase).toHaveBeenCalledTimes(0);
    expect(sendReplyMessage).toHaveBeenCalledTimes(1);
    expect(counterSpy).toHaveBeenCalledTimes(0);
  });

  test("command responds with correct ephemeral when trying to join a course twice", async () => {
    findAllCourseMembersByUser.mockImplementation(() => [ { courseId: 1, userId: 1 } ]);
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(createCourseMemberToDatabase).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You are already on the ${roleString} course.`);
  });
});