const { execute } = require("../../src/discordBot/slash_commands/faculty/newchannel");
const { sendEphemeral } = require("../../src/discordBot/slash_commands/utils");
const { getRoleFromCategory } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/slash_commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

getRoleFromCategory.mockImplementation((name) => name.replace("📚", "").trim());

const { defaultTeacherInteraction } = require("../temp/mockInteraction");
const courseName = "test";
const channelName = "rules";
defaultTeacherInteraction.data.options = [{ value: channelName }];

const setMaxChannels = (client) => {
  const category = client.guild.channels.cache.get(2).parent;
  for (let i = 3; i < 14; i++) {
    const channelToCreate = {
      name: i,
      parent: category,
      type: "text",
    };
    client.guild.channels.cache.set(i, channelToCreate);
  }
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash leave command", () => {
  test("if command is used outside course channels return correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, "Course not found, can´t create new channel");
  });

  test("new channel can be created if course channel count is less or equel than 10", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channel_id = 2;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `Created new channel ${courseName}_${channelName}`);
  });

  test("new channel cannot be created if course channel count is greater than 10", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channel_id = 2;
    setMaxChannels(client);
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, "Maximum text channel amount is 10");
  });
});