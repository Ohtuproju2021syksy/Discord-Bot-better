const { execute } = require("../../src/discordBot/slash_commands/faculty/hide");
const { sendEphemeral } = require("../../src/discordBot/slash_commands/utils");
const { createCategoryName } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/slash_commands/utils");
jest.mock("../../src/discordBot/services/service");

const { defaultTeacherInteraction } = require("../temp/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash hide command", () => {
  test("hide command with invalid course name responds with correct ephemeral", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `Invalid course name: ${courseName} or the course is private already.`);
  });
});