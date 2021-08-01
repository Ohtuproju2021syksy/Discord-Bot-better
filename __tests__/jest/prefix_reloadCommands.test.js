const { execute } = require("../../src/discordBot/commands/admin/reloadCommands");
const { reloadCommands } = require("../../src/discordBot/commands/utils");

jest.mock("../../src/discordBot/commands/utils");

const { messageInCommandsChannel, student } = require("../mocks/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix reload command", () => {
  test("user with administrator role can reload commands", async () => {
    const args = ["testcommand", "validCommand"];
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, args);
    expect(reloadCommands).toHaveBeenCalledTimes(1);
    expect(reloadCommands).toHaveBeenCalledWith(client, args);
  });

  test("user without administrator role cannot reload commands", async () => {
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    const args = ["testcommand", "validCommand"];
    await execute(messageInCommandsChannel, args);
    expect(reloadCommands).toHaveBeenCalledTimes(0);
  });
});