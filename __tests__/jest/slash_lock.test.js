const { execute } = require("../../src/discordBot/commands/faculty/lock");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");
const {
  createCategoryName,
  updateGuide,
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  setCourseToLocked,
  checkCourseCooldown } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const time = "4:59";
const initialResponse = "Locking course...";
createCategoryName.mockImplementation((name) => `📚 ${name}`);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const courseName = "test";
defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };

afterEach(() => {
  jest.clearAllMocks();
});

const Course = {
  create: jest.fn(),
  findOne: jest
    .fn(() => true)
    .mockImplementationOnce(() => false),
  destroy: jest.fn(),
};

describe("slash lock command", () => {
  test("lock command with invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${courseName} or the course is locked already!`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("lock command with valid course name responds with correct ephemeral", async () => {
    findChannelWithNameAndType.mockImplementationOnce((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    const client = defaultTeacherInteraction.client;
    const response = `This course ${courseName} is now locked.`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(setCourseToLocked).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("slash command with cooldown", async () => {
    findChannelWithNameAndType.mockImplementation((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    checkCourseCooldown.mockImplementation(() => time);
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, Course);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});