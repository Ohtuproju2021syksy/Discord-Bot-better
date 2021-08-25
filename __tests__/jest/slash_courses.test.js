const { execute } = require("../../src/discordBot/commands/student/courses");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { findCoursesFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

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
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, result);
  });

  test("responds correct list as ephemeral", async () => {
    const result = "Test course - `/join test`";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, result);
  });
});