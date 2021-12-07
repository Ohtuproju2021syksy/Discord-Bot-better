const {
  sendErrorReport,
  sendErrorEphemeral,
  sendEphemeral,
  editEphemeral,
  sendErrorReportNoInteraction,
  editEphemeralWithComponents,
  editEphemeralClearComponents,
  editErrorEphemeral } = require("../../src/discordBot/services/message");

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

  test("errors without interaction sent to commands channel", async () => {
    const member = { name: "Error generator" };
    const error = "faked error";
    const client = defaultAdminInteraction.client;
    const commandChannel = client.guild.channels.cache.find((c) => c.name === "commands");
    const channel = client.guild.channels.cache.get(defaultAdminInteraction.channelId);
    const msg = `**ERROR DETECTED!**\nMember: ${member}\nChannel: ${channel}`;
    await sendErrorReportNoInteraction(0, member, channel, client, error);
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

  test("edit ephemeral", async () => {
    const msg = "edited";
    await sendEphemeral(defaultAdminInteraction, "Wait...");
    await editEphemeral(defaultAdminInteraction, msg);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledWith({ content: "Wait...", ephemeral: true });
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledWith({ content: `${msg}`, ephemeral: true });
  });

  test("edit error ephemeral", async () => {
    const msg = "fake message";
    await sendEphemeral(defaultAdminInteraction, "Wait...");
    await editErrorEphemeral(defaultAdminInteraction, msg);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledWith({ content: "Wait...", ephemeral: true });
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledWith({ content: `Error: ${msg}`, ephemeral: true });
  });

  test("edit ephemeral with components", async () => {
    const msg = "Here's the components";
    const components = "components";
    await sendEphemeral(defaultAdminInteraction, "Wait...");
    await editEphemeralWithComponents(defaultAdminInteraction, msg, components);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledWith({ content: "Wait...", ephemeral: true });
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledWith({ content: `${msg}`, components: [components], ephemeral: true });
  });

  test("edit ephemeral clear components", async () => {
    const msg = "Components cleared";
    await sendEphemeral(defaultAdminInteraction, "Wait...");
    await editEphemeralClearComponents(defaultAdminInteraction, msg);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.reply).toHaveBeenCalledWith({ content: "Wait...", ephemeral: true });
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledTimes(1);
    expect(defaultAdminInteraction.editReply).toHaveBeenCalledWith({ content: `${msg}`, components: [], ephemeral: true });
  });
});