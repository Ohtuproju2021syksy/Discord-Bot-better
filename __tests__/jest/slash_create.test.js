const { execute } = require("../../src/discordBot/commands/faculty/create");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { findOrCreateRoleWithName,
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

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash create command", () => {
  test("find or create correct roles", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(findOrCreateRoleWithName).toHaveBeenCalledTimes(2);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(courseName, client.guild);
    expect(findOrCreateRoleWithName).toHaveBeenCalledWith(`${courseName} ${courseAdminRole}`, client.guild);
  });

  test("find category name", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(findCategoryName).toHaveBeenCalledWith(courseName, client.guild);
  });

  test("create channels: category, announcement, general and voice ", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(findOrCreateChannel).toHaveBeenCalledTimes(4);
  });

  test("set course positions", async () => {
    const courseName = "test";
    const categoryName = `📚 ${courseName}`;
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(setCoursePositionABC).toHaveBeenCalledTimes(1);
    expect(setCoursePositionABC).toHaveBeenCalledWith(client.guild, categoryName);
  });

  test("create invitation", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createInvitation).toHaveBeenCalledTimes(1);
    expect(createInvitation).toHaveBeenCalledWith(client.guild, courseName);
  });

  test("respond with correct emphemeral", async () => {
    const courseName = "test";
    const result = `Created course ${courseName}.`;
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, result);
  });

  test("update join/leave command list", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledWith("COURSES_CHANGED");
  });

  test("update guide", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledWith(client.guild);
  });
});