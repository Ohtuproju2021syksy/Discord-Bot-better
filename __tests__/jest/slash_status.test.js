const { execute } = require("../../src/discordBot/commands/faculty/status");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { courseAdminRole } = require("../../config.json");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

const {
  defaultTeacherInteraction,
} = require("../mocks/mockInteraction");

const roleString = "test";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash status command", () => {
  test("used outside course channels", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "This is not a course category, can not execute the command";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

});
