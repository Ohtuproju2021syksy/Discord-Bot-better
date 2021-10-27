const { execute } = require("../../../src/discordBot/commands/instructor/add_instructor");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { isCourseCategory, trimCourseName } = require("../../../src/discordBot/services/service");
const { findUserByDiscordId } = require("../../../src/db/services/userService");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { findCourseMember } = require("../../../src/db/services/courseMemberService");
const { courseAdminRole } = require("../../../config.json");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/userService");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/courseMemberService");

isCourseCategory.mockImplementation(() => true);
trimCourseName.mockImplementation(() => "test");
findUserByDiscordId.mockImplementation(() => { return { id: 1 }; });
findCourseFromDb.mockImplementation(() => { return { id: 1 }; });
findCourseMember.mockImplementation(() => { return { id: 1, instructor: false, save: () => null }; });

const { defaultTeacherInteraction, defaultStudentInteraction, defaultAdminInteraction } = require("../../mocks/mockInteraction");
defaultAdminInteraction.options = { getUser: jest.fn(() => { return { id: 3 }; }) };

const initialResponse = "Adding instructor...";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash add instructor command", () => {
  test("if no permission to use the command reponds with correct ephemeral", async () => {
    const client = defaultStudentInteraction.client;
    const response = "You don't have the permission to use this command!";
    await execute(defaultStudentInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("command must be used in course channel", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Command must be used in a course channel!";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("instructor role can be given", async () => {
    const roleString = "test";
    const client = defaultAdminInteraction.client;
    const response = `Gave role '${roleString} ${courseAdminRole}' to admin.`;
    const admin = client.guild.members.cache.get(3);
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [] });
    await execute(defaultAdminInteraction, client, models);
    expect(admin.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, response);
  });
});