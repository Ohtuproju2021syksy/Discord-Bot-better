const { execute } = require("../../../src/discordBot/commands/student/leave");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { updateGuide, findCourseFromDb } = require("../../../src/discordBot/services/service");
const { removeCourseMemberFromDb } = require("../../../src/discordBot/services/courseMemberService");
const { findUserByDiscordId } = require("../../../src/discordBot/services/userService");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/discordBot/services/userService");
jest.mock("../../../src/discordBot/services/courseMemberService");

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
const roleString = "testing";
defaultTeacherInteraction.options = { getString: jest.fn(() => roleString) };
const initialResponse = "Leaving course...";

const course = { id: 1, name: "tester", fullName: "test course", code: "101", private: false };
findCourseFromDb.mockImplementation(() => course);

user = { name: "test", id: 1 };
findUserByDiscordId.mockImplementation(() => user)
removeCourseMemberFromDb.mockImplementation(() => {})

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash leave command", () => {
  test("invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${roleString}`;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("if user does not have course role responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: roleString });
    const response = `You are not on a ${roleString} course.`;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("leave with proper course name and roles return correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    const memberRolesLengthAtStart = member.roles.cache.length;
    const response = `You have been removed from the ${roleString} course.`;
    await member.roles.add(roleString);
    await execute(defaultTeacherInteraction, client, models);
    expect(member.roles.remove).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(member.roles.cache.length).toBe(memberRolesLengthAtStart);
    expect(member.fetch).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });
});