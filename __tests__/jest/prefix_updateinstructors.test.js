const { execute } = require("../../src/discordBot/commands/admin/updateinstructors");
const { findAllCourseNames, findAndUpdateInstructorRole } = require("../../src/discordBot/services/service");
const { courseAdminRole } = require("../../config.json");

jest.mock("../../src/discordBot/services/service");

const { messageInCommandsChannel, teacher, student } = require("../mocks/mockMessages");
const courseString = "test";

findAllCourseNames
  .mockImplementation(() => [])
  .mockImplementationOnce(() => [courseString]);

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix updateinstructors command", () => {
  test("if user does not have administrator permission do nothing", async () => {
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel);
    expect(findAllCourseNames).toHaveBeenCalledTimes(0);
    expect(findAndUpdateInstructorRole).toHaveBeenCalledTimes(0);
  });

  test("if user has administrator permission then update roles", async () => {
    messageInCommandsChannel.member = teacher;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel);
    expect(findAllCourseNames).toHaveBeenCalledTimes(1);
    expect(findAllCourseNames).toHaveBeenCalledWith(client.guild);
    expect(findAndUpdateInstructorRole).toHaveBeenCalledTimes(1);
    expect(findAndUpdateInstructorRole).toHaveBeenCalledWith(courseString, client.guild, courseAdminRole);
  });
});