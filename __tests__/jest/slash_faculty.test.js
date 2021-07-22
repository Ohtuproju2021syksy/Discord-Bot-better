const { execute } = require("../../src/discordBot/slash_commands/faculty/faculty");
const { sendEphemeral } = require("../../src/discordBot/slash_commands/utils");

jest.mock("../../src/discordBot/slash_commands/utils");

const { defaultTeacherInteraction } = require("../temp/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash hide command", () => {
  test("hide command with invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `${process.env.BACKEND_SERVER_URL}/authenticate_faculty`);
  });
});