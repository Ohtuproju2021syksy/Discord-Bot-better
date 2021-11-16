const { execute } = require("../../../src/discordBot/commands/faculty/add_instructors");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { isCourseCategory, getCourseNameFromCategory } = require("../../../src/discordBot/services/service");
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
getCourseNameFromCategory.mockImplementation(() => "test");
findUserByDiscordId.mockImplementation(() => { return { id: 1 }; });
findCourseFromDb.mockImplementation(() => { return { id: 1 }; });
findCourseMember.mockImplementation(() => { return { id: 1, instructor: false, save: () => null }; });

const { defaultTeacherInteraction, defaultAdminInteraction } = require("../../mocks/mockInteraction");
defaultAdminInteraction.options = { getString: jest.fn(() => { return "<@!3>"; }) };
defaultTeacherInteraction.options = { getUser: jest.fn(() => { return { id: 2 }; }) };

const initialResponse = "Adding instructor...";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash add instructor command", () => {
  test("command must be used in course channel", async () => {
    isCourseCategory.mockImplementationOnce(() => false);
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
    const response = `Gave role '${roleString} ${courseAdminRole}' to all.`;
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