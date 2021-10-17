const { execute } = require("../../../src/discordBot/commands/admin/delete_command");
const { deletecommand } = require("../../../src/discordBot/services/service");

jest.mock("../../../src/discordBot/services/service");

const { messageInCommandsChannel, student } = require("../../mocks/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix delete_command command", () => {
  test("user with administrator role can delete command", async () => {
    const args = ["testcommand"];
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, args);
    expect(deletecommand).toHaveBeenCalledTimes(1);
    expect(deletecommand).toHaveBeenCalledWith(client, args[0]);
  });

  test("user without administrator role cannot delete command", async () => {
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    const args = ["testcommand"];
    await execute(messageInCommandsChannel, args);
    expect(deletecommand).toHaveBeenCalledTimes(0);
  });
});