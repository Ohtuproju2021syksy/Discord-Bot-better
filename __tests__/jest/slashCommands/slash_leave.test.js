const { execute } = require("../../../src/discordBot/commands/student/leave");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { findAllCourseMembersByUser, removeCourseMemberFromDb } = require("../../../src/db/services/courseMemberService");
const { findUserByDiscordId } = require("../../../src/db/services/userService");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/userService");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/courseMemberService");

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../../mocks/mockInteraction");
const roleString = "tester";
defaultTeacherInteraction.options = { getString: jest.fn(() => roleString) };
defaultStudentInteraction.options = { getString: jest.fn(() => "invalid") };
const initialResponse = "Leaving course...";

const course = { id: 1, name: "tester", fullName: "test course", code: "101", private: false };
findCourseFromDb.mockImplementation((role) => role === course.name ? course : undefined);

const user = { name: "test", id: 1 };
findUserByDiscordId.mockImplementation(() => user);

findAllCourseMembersByUser
  .mockImplementation(() => [ { courseId: 1, userId: 1 } ])
  .mockImplementationOnce(() => []);

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash leave command", () => {
  test("invalid course name responds with correct ephemeral", async () => {
    const client = defaultStudentInteraction.client;
    const response = "Invalid course name: invalid";
    await execute(defaultStudentInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(removeCourseMemberFromDb).toHaveBeenCalledTimes(0);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("if user does not have course role responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: roleString });
    const response = `You are not on the ${roleString} course.`;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(removeCourseMemberFromDb).toHaveBeenCalledTimes(0);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("leave with proper course name and roles return correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `You have been removed from the ${roleString} course.`;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(removeCourseMemberFromDb).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});