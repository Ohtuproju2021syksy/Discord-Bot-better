const { execute } = require("../../src/discordBot/commands/faculty/create");
const { sendEphemeral, sendErrorEphemeral, editEphemeral } = require("../../src/discordBot/services/message");
const {
  findCourseFromDb,
  findCourseFromDbWithFullName,
  findOrCreateRoleWithName,
  findCategoryName,
  findOrCreateChannel,
  setCoursePositionABC,
  createInvitation,
  updateGuide } = require("../../src/discordBot/services/service");
const { courseAdminRole } = require("../../config.json");
const models = require("../mocks/mockModels");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

findOrCreateRoleWithName.mockImplementation((name) => { return { id: Math.floor(Math.random() * 10) + 5, name: name }; });
findCategoryName.mockImplementation((name) => `📚 ${name}`);
findCourseFromDbWithFullName
  .mockImplementation(() => false)
  .mockImplementationOnce(() => true);
findCourseFromDb
  .mockImplementation(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => true);

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../mocks/mockInteraction");
defaultTeacherInteraction.options = {
  getString: jest.fn((name) => {
    const names = {
      coursecode: "TKT-100",
      full_name: "Long course name",
      nick_name: "nick name",
    };
    return names[name];
  }),
};

defaultStudentInteraction.options = {
  getString: jest.fn((name) => {
    const names = {
      coursecode: "TKT-100",
      full_name: "Long course name",
    };
    return names[name];
  }),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash create command", () => {
  test("course name must be unique", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course fullname must be unique.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("course nick name must be unique", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course nick name must be unique.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("course code must be unique when nickname not given", async () => {
    const client = defaultStudentInteraction.client;
    const response = "Course code must be unique.";
    await execute(defaultStudentInteraction, client, models);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("create course name without nick", async () => {
    const courseCode = "TKT-100";
    const client = defaultStudentInteraction.client;
    await execute(defaultStudentInteraction, client, models);
    expect(findOrCreateRoleWithName).toHaveBeenCalledTimes(2);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(courseCode, client.guild);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(`${courseCode} ${courseAdminRole}`, client.guild);
  });

  test("find or create correct roles", async () => {
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(findOrCreateRoleWithName).toHaveBeenCalledTimes(2);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(courseName, client.guild);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(`${courseName} ${courseAdminRole}`, client.guild);
  });

  test("find category name", async () => {
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(findCategoryName).toHaveBeenCalledWith(courseName, client.guild);
  });

  test("create channels: category, announcement, general and voice ", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(findOrCreateChannel).toHaveBeenCalledTimes(4);
  });

  test("set course positions", async () => {
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    const categoryName = `📚 ${courseName}`;
    await execute(defaultTeacherInteraction, client, models);
    expect(setCoursePositionABC).toHaveBeenCalledTimes(1);
    expect(setCoursePositionABC).toHaveBeenCalledWith(client.guild, categoryName);
  });

  test("create invitation", async () => {
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(createInvitation).toHaveBeenCalledTimes(1);
    expect(createInvitation).toHaveBeenCalledWith(client.guild, courseName);
  });

  test("respond with correct emphemeral", async () => {
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    const result = `Created course ${courseName}.`;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Creating course...");
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, result);
  });

  test("update join/leave command list", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(client.emit).toHaveBeenCalledTimes(1);
  });

  test("update guide", async () => {
    const course = models.Course;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, course);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledWith(client.guild, undefined);
  });
});