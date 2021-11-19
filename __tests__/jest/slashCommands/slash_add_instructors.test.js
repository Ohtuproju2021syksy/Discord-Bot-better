const { execute } = require("../../../src/discordBot/commands/faculty/add_instructors");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { getCourseNameFromCategory, getUserWithUserId } = require("../../../src/discordBot/services/service");
const { findUserByDiscordId } = require("../../../src/db/services/userService");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { findCourseMember } = require("../../../src/db/services/courseMemberService");
const { courseAdminRole } = require("../../../config.json");
const { defaultTeacherInteraction, defaultAdminInteraction } = require("../../mocks/mockInteraction");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/userService");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/courseMemberService");

getCourseNameFromCategory.mockImplementation(() => "test");
findUserByDiscordId.mockImplementation(() => { return { id: 1 }; });
findCourseFromDb.mockImplementation(() => { return { id: 1, name: "test" }; });
findCourseFromDb.mockImplementationOnce(() => null);
findCourseMember.mockImplementation(() => { return { id: 1, instructor: false, save: () => null }; });
findCourseMember.mockImplementationOnce(() => null);
getUserWithUserId.mockImplementation(() => defaultAdminInteraction.member.user);


defaultAdminInteraction.options = { getString: jest.fn(() => { return "<@!3>"; }) };
defaultTeacherInteraction.options = { getUser: jest.fn(() => { return { id: 2 }; }) };

const initialResponse = "Adding instructors...";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash add instructor command", () => {
  test("Cannot use command if channel has no parent", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course not found, execution stopped.";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(findCourseFromDb).toHaveBeenCalledTimes(0);
    expect(getUserWithUserId).toHaveBeenCalledTimes(0);
    expect(findCourseMember).toHaveBeenCalledTimes(0);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Cannot use command if channel is not course channel", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "Command must be used in a course channel!";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(getUserWithUserId).toHaveBeenCalledTimes(0);
    expect(findCourseMember).toHaveBeenCalledTimes(0);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Cannot use command if given user is not a course member", async () => {
    const roleString = "test";
    const client = defaultTeacherInteraction.client;
    const response = "All listed users must be members of this course!";
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [] });
    await execute(defaultAdminInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, initialResponse);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(getUserWithUserId).toHaveBeenCalledTimes(1);
    expect(findCourseMember).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, response);
  });

  test("instructor role can be given", async () => {
    const roleString = "test";
    const client = defaultAdminInteraction.client;
    const response = `Gave role '${roleString} ${courseAdminRole}' to all users listed.`;
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [] });
    await execute(defaultAdminInteraction, client, models);
    const admin = client.guild.members.cache.get(3);
    expect(admin.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, initialResponse);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(getUserWithUserId).toHaveBeenCalledTimes(1);
    expect(findCourseMember).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, response);
  });
});