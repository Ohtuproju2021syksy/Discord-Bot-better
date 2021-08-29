const { execute } = require("../../src/discordBot/commands/faculty/create");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
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

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

findOrCreateRoleWithName.mockImplementation((name) => { return { id: Math.floor(Math.random() * 10) + 5, name: name }; });
findCategoryName.mockImplementation((name) => `📚 ${name}`);
findCourseFromDbWithFullName
  .mockImplementation(() => false)
  .mockImplementationOnce(() => true);
findCourseFromDb
  .mockImplementation(() => false)
  .mockImplementationOnce(() => true);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash create command", () => {
  test("course name must be unique", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.options.getString("input") = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    const response = "Error: Course fullname must be unique.";
    await execute(defaultTeacherInteraction, client);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("course name must be unique", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    const response = "Error: Course name must be unique.";
    await execute(defaultTeacherInteraction, client);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("create course name without nick", async () => {
    const courseCode = "tkt-100";
    const courseFull = "Long course name";
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(findOrCreateRoleWithName).toHaveBeenCalledTimes(2);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(courseCode, client.guild);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(`${courseCode} ${courseAdminRole}`, client.guild);
  });

  test("find or create correct roles", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.data.options.push({ value: "", command: {} });
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    await execute(defaultTeacherInteraction, client);
    expect(findOrCreateRoleWithName).toHaveBeenCalledTimes(2);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(courseName, client.guild);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(`${courseName} ${courseAdminRole}`, client.guild);
  });

  test("find category name", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    await execute(defaultTeacherInteraction, client);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(findCategoryName).toHaveBeenCalledWith(courseName, client.guild);
  });

  test("create channels: category, announcement, general and voice ", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    await execute(defaultTeacherInteraction, client);
    expect(findOrCreateChannel).toHaveBeenCalledTimes(4);
  });

  test("set course positions", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    const categoryName = `📚 ${courseName}`;
    defaultTeacherinteraction.options.getString("input").value = courseName;
    await execute(defaultTeacherInteraction, client);
    expect(setCoursePositionABC).toHaveBeenCalledTimes(1);
    expect(setCoursePositionABC).toHaveBeenCalledWith(client.guild, categoryName);
  });

  test("create invitation", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input") = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    await execute(defaultTeacherInteraction, client);
    expect(createInvitation).toHaveBeenCalledTimes(1);
    expect(createInvitation).toHaveBeenCalledWith(client.guild, courseName);
  });

  test("respond with correct emphemeral", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    const result = `Created course ${courseName}.`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, result);
  });

  test("update join/leave command list", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    await execute(defaultTeacherInteraction, client);
    expect(client.emit).toHaveBeenCalledTimes(1);
  });

  test("update guide", async () => {
    const courseCode = "TKT-100";
    const courseFull = "Long course name";
    const courseName = "nick name";
    const Course = undefined;
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = courseCode;
    defaultTeacherInteraction.data.options[1].value = courseFull;
    defaultTeacherInteraction.data.options[2].value = courseName;
    await execute(defaultTeacherInteraction, client, Course);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledWith(client.guild, Course);
  });
});