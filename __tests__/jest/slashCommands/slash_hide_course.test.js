const { execute } = require("../../../src/discordBot/commands/faculty/hide_course");
const { editEphemeral, editErrorEphemeral, sendEphemeral, confirmChoice } = require("../../../src/discordBot/services/message");
const {
  msToMinutesAndSeconds,
  checkCourseCooldown,
  getPublicCourse } = require("../../../src/discordBot/services/service");
const { updateGuide, setCourseToPrivate } = require("../../../src/db/services/courseService");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");

const time = "4:59";
const initialResponse = "Hiding course...";

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
const courseName = "test";
defaultTeacherInteraction.options = { getString: jest.fn(() => courseName) };
confirmChoice.mockImplementation(() => true);
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

describe("slash hide command", () => {
  test("hide command with invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${courseName} or the course is private already!`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(getPublicCourse).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("hide command with valid course name responds with correct ephemeral", async () => {
    getPublicCourse.mockImplementationOnce((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    const client = defaultTeacherInteraction.client;
    const response = `This course ${courseName} is now private.`;
    await execute(defaultTeacherInteraction, client, Course);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(getPublicCourse).toHaveBeenCalledTimes(1);
    expect(setCourseToPrivate).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("hide command with cooldown", async () => {
    getPublicCourse.mockImplementation((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    checkCourseCooldown.mockImplementation(() => time);
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, Course);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(getPublicCourse).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});
