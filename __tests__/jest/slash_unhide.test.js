const { execute } = require("../../src/discordBot/commands/faculty/unhide");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const {
  createPrivateCategoryName,
  updateGuide,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  setCourseToPublic } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

createPrivateCategoryName.mockImplementation((name) => `🔒 ${name}`);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash hide command", () => {
  test("hide command with invalid course name responds with correct ephemeral", async () => {
    const courseName = "test";
    defaultTeacherinteraction.options.getString("input").value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createPrivateCategoryName).toHaveBeenCalledTimes(1);
    expect(createPrivateCategoryName).toHaveBeenCalledWith(courseName);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `Invalid course name: ${courseName} or the course is public already.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("hide command with valid course name responds with correct ephemeral", async () => {
    const courseName = "test";
    findChannelWithNameAndType.mockImplementationOnce((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    defaultTeacherinteraction.options.getString("input").value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createPrivateCategoryName).toHaveBeenCalledTimes(1);
    expect(createPrivateCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(setCourseToPublic).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `This course ${courseName} is now public.`);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("hide command with cooldown", async () => {
    const courseName = "test";
    findChannelWithNameAndType.mockImplementation((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    defaultTeacherinteraction.options.getString("input").value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createPrivateCategoryName).toHaveBeenCalledTimes(1);
    expect(createPrivateCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});