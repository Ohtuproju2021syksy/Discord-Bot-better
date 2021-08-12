const { execute } = require("../../src/discordBot/commands/student/courses");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { getRoleFromCategory } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

getRoleFromCategory.mockImplementation((name) => name.replace("📚", "").trim());

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("courses slash command", () => {
  test("responds correct list as ephemeral", () => {
    const result = "a - `/join a` \ntest - `/join test`";
    const client = defaultTeacherInteraction.client;
    client.guild.channels.create("📚 a", { type: "category" });
    execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, result);
  });

  test("If no courses responds with no courses available ephemeral", () => {
    const result = "No courses available";
    const client = defaultTeacherInteraction.client;
    client.guild.channels.init();
    execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, result);
  });
});