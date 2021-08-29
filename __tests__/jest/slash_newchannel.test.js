const { execute } = require("../../src/discordBot/commands/faculty/newchannel");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { getRoleFromCategory } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

getRoleFromCategory.mockImplementation((name) => name.replace("📚", "").trim());

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const courseName = "test";
const channelName = "rules";
defaultTeacherInteraction.data.options = [{ value: channelName }];

const setMaxChannels = (client) => {
  const category = client.guild.channels.cache.get(2).parent;
  for (let i = 3; i < 15; i++) {
    const channelToCreate = {
      name: i,
      parent: category,
      type: "GUILD_TEXT",
    };
    client.guild.channels.cache.set(i, channelToCreate);
  }
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash new channel command", () => {
  test("Cannot use command if channel has no parent", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course not found, can not create new channel.";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("Cannot use command if channel is not course channel", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 4;
    const response = "This is not a course category, can not create new channel.";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("new channel can be created if course channel count is less or equel than 10", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Created new channel ${courseName}_${channelName}`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("new channel cannot be created if course channel count is greater than 10", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    setMaxChannels(client);
    const response = "Maximum added text channel amount is 10";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });
});
