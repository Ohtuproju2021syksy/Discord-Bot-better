const { execute } = require("../../src/discordBot/commands/faculty/unhide");
const { sendEphemeral, sendErrorEphemeral } = require("../../src/discordBot/services/message");
const {
  createPrivateCategoryName,
  updateGuide,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  setCourseToPublic } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

createPrivateCategoryName.mockImplementation((name) => `🔒 ${name}`);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const courseName = "test";
defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash hide command", () => {
  test("hide command with invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${courseName} or the course is public already!`;
    await execute(defaultTeacherInteraction, client);
    expect(createPrivateCategoryName).toHaveBeenCalledTimes(1);
    expect(createPrivateCategoryName).toHaveBeenCalledWith(courseName);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("hide command with valid course name responds with correct ephemeral", async () => {
    findChannelWithNameAndType.mockImplementationOnce((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    const client = defaultTeacherInteraction.client;
    const response = `This course ${courseName} is now public.`;
    await execute(defaultTeacherInteraction, client);
    expect(createPrivateCategoryName).toHaveBeenCalledTimes(1);
    expect(createPrivateCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(setCourseToPublic).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("hide command with cooldown", async () => {
    findChannelWithNameAndType.mockImplementation((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createPrivateCategoryName).toHaveBeenCalledTimes(1);
    expect(createPrivateCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});