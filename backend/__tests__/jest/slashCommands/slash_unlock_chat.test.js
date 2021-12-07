const { execute } = require("../../../src/discordBot/commands/faculty/unlock_chat");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../../src/discordBot/services/message");
const { confirmChoice } = require("../../../src/discordBot/services/confirm");
const {
  msToMinutesAndSeconds,
  checkCourseCooldown } = require("../../../src/discordBot/services/service");
const { setCourseToUnlocked, findCourseFromDb } = require("../../../src/db/services/courseService");

jest.mock("../../../src/bridge/service");
jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/confirm");
jest.mock("../../../src/discordBot/services/service");
confirmChoice.mockImplementation(() => true);
jest.mock("../../../src/db/services/courseService");


const Course = {
  create: jest.fn(),
  findOne: jest
    .fn(() => true)
    .mockImplementationOnce(() => false),
  destroy: jest.fn(),
};

const time = "4:59";
const initialResponse = "Unlocking course...";
const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
const courseName = "test";
defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash unlock_chat command", () => {
  test("unlock_chat command with invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${courseName} or the course is unlocked already!`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("unlock_chat command with valid course name responds with correct ephemeral", async () => {
    findCourseFromDb.mockImplementationOnce((name) => { return { name: name, locked: true }; });
    const client = defaultTeacherInteraction.client;
    const response = `This course ${courseName} is now unlocked.`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(setCourseToUnlocked).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(client.emit).toHaveBeenCalledTimes(1);
  });

  test("unlock_chat command with cooldown", async () => {
    findCourseFromDb.mockImplementation((name) => { return { name: name, locked: true }; });
    checkCourseCooldown.mockImplementation(() => time);
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, Course);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
  });
});