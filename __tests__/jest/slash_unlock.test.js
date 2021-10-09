const { execute } = require("../../src/discordBot/commands/faculty/unlock");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../src/discordBot/services/message");
const {
  createLockedCategoryName,
  updateGuide,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  setCourseToUnlocked,
  checkCourseCooldown } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

createLockedCategoryName.mockImplementation((name) => `🔐 ${name}`);

const Course = {
    create: jest.fn(),
    findOne: jest
      .fn(() => true)
      .mockImplementationOnce(() => false),
    destroy: jest.fn(),
  };

const time = "4:59";
const initialResponse = "Unlocking course...";
const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const courseName = "test";
defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash unlock command", () => {
  test("unlock command with invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${courseName} or the course is public already!`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(createLockedCategoryName).toHaveBeenCalledTimes(1);
    expect(createLockedCategoryName).toHaveBeenCalledWith(courseName);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("unlock command with valid course name responds with correct ephemeral", async () => {
    findChannelWithNameAndType.mockImplementationOnce((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    const client = defaultTeacherInteraction.client;
    const response = `This course ${courseName} is now public.`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(createLockedCategoryName).toHaveBeenCalledTimes(1);
    expect(createLockedCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(setCourseToUnlocked).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("unlock command with cooldown", async () => {
    findChannelWithNameAndType.mockImplementation((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    checkCourseCooldown.mockImplementation(() => time);
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, Course);
    expect(createLockedCategoryName).toHaveBeenCalledTimes(1);
    expect(createLockedCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});