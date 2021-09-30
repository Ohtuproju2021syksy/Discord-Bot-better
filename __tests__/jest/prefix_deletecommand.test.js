const { execute } = require("../../src/discordBot/commands/admin/deleteCommand");
const { deleteCommand } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/service");

const { messageInCommandsChannel, student } = require("../mocks/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix deletecommand command", () => {
  test("user with administrator role can delete command", async () => {
    const args = ["testcommand"];
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, args);
    expect(deleteCommand).toHaveBeenCalledTimes(1);
    expect(deleteCommand).toHaveBeenCalledWith(client, args[0]);
  });

  test("user without administrator role cannot delete command", async () => {
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    const args = ["testcommand"];
    await execute(messageInCommandsChannel, args);
    expect(deleteCommand).toHaveBeenCalledTimes(0);
  });
});