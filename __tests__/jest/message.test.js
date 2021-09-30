const {
  sendErrorReport,
  sendErrorEphemeral,
  sendEphemeral } = require("../../src/discordBot/services/message");

const { defaultAdminInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("message service", () => {
  test("errors sent to commands channel", async () => {
    const client = defaultAdminInteraction.client;
    const commandChannel = client.guild.channels.cache.find((c) => c.name === "commands");
    const channel = client.guild.channels.cache.get(defaultAdminInteraction.channelId);
    const error = "faked error";
    const msg = `**ERROR DETECTED!**\nMember: admin\nCommand: ${defaultAdminInteraction.commandName}\nChannel: ${channel.name}`;
    await sendErrorReport(defaultAdminInteraction, client, error);
    expect(commandChannel.send).toHaveBeenCalledTimes(2);
    expect(commandChannel.send).toHaveBeenCalledWith({ content: msg });
    expect(commandChannel.send).toHaveBeenCalledWith({ content: error });
  });

  test("error ephemeral", async () => {
    const msg = "fake message";
    await sendErrorEphemeral(defaultAdminInteraction, msg);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledWith({ content: `Error: ${msg}`, ephemeral: true });
  });

  test("ephemeral", async () => {
    const msg = "fake message";
    await sendEphemeral(defaultAdminInteraction, msg);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledWith({ content: `${msg}`, ephemeral: true });
  });
});