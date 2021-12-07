const { execute, args } = require("../../../src/discordBot/commands/admin/sort_courses");

const { messageInCommandsChannel, student } = require("../../mocks/mockMessages");
const { findCategoryWithCourseName } = require("../../../src/discordBot/services/service");
const { findAllCourseNames } = require("../../../src/db/services/courseService");

const models = require("../../mocks/mockModels");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/discordBot/services/service");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix sort courses command", () => {
  test("user with administrator role can sort commands manually", async () => {
    const client = messageInCommandsChannel.client;
    const channelA = { name: "📚 a", type: "GUILD_CATEGORY", edit: jest.fn(), position: 2 };
    const channelB = { name: "📚 b", type: "GUILD_CATEGORY", edit: jest.fn(), position: 1 };
    client.guild.channels.cache.set(1, channelB);
    client.guild.channels.cache.set(2, channelA);
    findAllCourseNames.mockImplementationOnce(() => ["b", "a"]);
    findCategoryWithCourseName.mockImplementationOnce(() => client.guild.channels.cache.get(1));
    findCategoryWithCourseName.mockImplementationOnce(() => client.guild.channels.cache.get(2));
    await execute(messageInCommandsChannel, args, models.Course);
    expect(findAllCourseNames).toHaveBeenCalledTimes(1);
    expect(findCategoryWithCourseName).toHaveBeenCalledTimes(2);
    expect(channelA.edit).toHaveBeenCalledTimes(1);
    expect(channelB.edit).toHaveBeenCalledTimes(1);
    client.guild.channels.init();
  });

  test("user without administrator role cannot use sort command", async () => {
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    const channelA = { name: "📚 a", type: "GUILD_CATEGORY", edit: jest.fn(), position: 2 };
    const channelB = { name: "📚 b", type: "GUILD_CATEGORY", edit: jest.fn(), position: 1 };
    client.guild.channels.cache.set(1, channelB);
    client.guild.channels.cache.set(2, channelA);
    await execute(messageInCommandsChannel, args, models.Course);
    expect(findAllCourseNames).toHaveBeenCalledTimes(0);
    expect(findCategoryWithCourseName).toHaveBeenCalledTimes(0);
    expect(channelA.edit).toHaveBeenCalledTimes(0);
    expect(channelB.edit).toHaveBeenCalledTimes(0);
    client.guild.channels.init();
  });
});