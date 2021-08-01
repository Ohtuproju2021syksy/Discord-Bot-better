const { execute } = require("../../src/discordBot/events/message");

const { messageInGuideChannel } = require("../mocks/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix commands", () => {
  test("prefix commands cannot be used in guide channel", async () => {
    messageInGuideChannel.content = "!join test";
    const client = messageInGuideChannel.client;
    await execute(messageInGuideChannel, client);
    expect(messageInGuideChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.reply).toHaveBeenCalledTimes(0);
  });
});