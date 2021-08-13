const { execute } = require("../../src/discordBot/commands/instructor/addinstructor");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { isACourseCategory } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

isACourseCategory.mockImplementation(() => true);

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash add instructor command", () => {
  test("if no permission to use the command reponds with correct ephemeral", async () => {
    const client = defaultStudentInteraction.client;
    const response = "You don't have the permission to use this command.";
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultStudentInteraction, response);
  });

  test("command must be used in course channel", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Command must be used in a course channel.";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });
});