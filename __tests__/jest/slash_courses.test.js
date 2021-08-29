const { execute } = require("../../src/discordBot/commands/student/courses");
const { sendErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");
const { findCoursesFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const course = [{ code: "tkt test", fullName: "test course", name: "test" }];

findCoursesFromDb
  .mockImplementation(() => course)
  .mockImplementationOnce(() => []);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("courses slash command", () => {
  test("If no courses: responds with no courses available ephemeral", async () => {
    const result = "No courses available";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, result);
  });

  test("responds correct list as ephemeral", async () => {
    const result = "Test course - `/join test`";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, result);
  });
});