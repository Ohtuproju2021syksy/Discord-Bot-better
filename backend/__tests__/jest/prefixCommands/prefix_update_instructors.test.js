const { execute } = require("../../../src/discordBot/commands/admin/update_instructors");
const { findAndUpdateInstructorRole } = require("../../../src/discordBot/services/service");
const { findAllCourseNames } = require("../../../src/db/services/courseService");
const { courseAdminRole } = require("../../../config.json");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");

const { messageInCommandsChannel, teacher, student } = require("../../mocks/mockMessages");
const courseString = "test";
const args = "";

findAllCourseNames.mockImplementation(() => [courseString]);

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix update_instructors command", () => {
  test("if user does not have administrator permission do nothing", async () => {
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel, args, models);
    expect(findAllCourseNames).toHaveBeenCalledTimes(0);
    expect(findAndUpdateInstructorRole).toHaveBeenCalledTimes(0);
  });

  test("if user has administrator permission then update roles", async () => {
    messageInCommandsChannel.member = teacher;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, args, models);
    expect(findAllCourseNames).toHaveBeenCalledTimes(1);
    expect(findAllCourseNames).toHaveBeenCalledWith(models.Course);
    expect(findAndUpdateInstructorRole).toHaveBeenCalledTimes(1);
    expect(findAndUpdateInstructorRole).toHaveBeenCalledWith(courseString, client.guild, courseAdminRole);
  });
});