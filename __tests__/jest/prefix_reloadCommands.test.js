const { execute } = require("../../src/discordBot/commands/admin/reloadCommands");
const { setUpCommands } = require("../../src/discordBot/services/command");

jest.mock("../../src/discordBot/services/command");

const { messageInCommandsChannel, student } = require("../mocks/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

const Course = {};
const args = [];

describe("prefix reload command", () => {
  test("user with administrator role can reload commands", async () => {
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, args, Course);
    expect(setUpCommands).toHaveBeenCalledTimes(1);
    expect(setUpCommands).toHaveBeenCalledWith(client, Course);
  });

  test("user without administrator role cannot reload commands", async () => {
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel, args, Course);
    expect(setUpCommands).toHaveBeenCalledTimes(0);
  });
});