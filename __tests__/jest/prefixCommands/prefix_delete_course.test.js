const { execute } = require("../../../src/discordBot/commands/admin/delete_course");
const { findCategoryName, updateGuide, removeCourseFromDb } = require("../../../src/discordBot/services/service");

jest.mock("../../../src/discordBot/services/service");

findCategoryName
  .mockImplementation((name) => `📚 ${name}`)
  .mockImplementationOnce(() => "📚 testa");

const { messageInCommandsChannel, teacher, student } = require("../../mocks/mockMessages");


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

describe("prefix remove", () => {
  test("Only administrator can use remove command", async () => {
    messageInCommandsChannel.member = student;
    const courseName = "test";
    await execute(messageInCommandsChannel, [courseName], Course);
    expect(findCategoryName).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(removeCourseFromDb).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("remove command with invalid course name responds correct ephemeral", async () => {
    messageInCommandsChannel.member = teacher;
    const courseName = "test";
    const response = `Error: Invalid course name: ${courseName}.`;
    await execute(messageInCommandsChannel, [courseName], Course);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledWith(response);
  });

  test("remove command with valid course name responds correct ephemeral", async () => {
    messageInCommandsChannel.member = teacher;
    const courseName = "test";
    await execute(messageInCommandsChannel, [courseName], Course);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(removeCourseFromDb).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });
});
