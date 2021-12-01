const { initializeApplicationContext } = require("../../src/discordBot/services/init");
const { initHooks } = require("../../src/db/hookInit");
const models = require("../mocks/mockModels");
const { client } = require("../mocks/mockClient");

jest.mock("../../src/db/services/courseService");
jest.mock("../../src/discordBot/services/service");
jest.mock("../../src/db/hookInit");

initHooks.mockImplementation(() => true);

afterEach(() => {
  jest.clearAllMocks();
});

describe("Initialize", () => {
  test("After initialization channels correct channels and roles found", async () => {
    client.guild.roles.create({ name: "admin" });
    await initializeApplicationContext(client, models);
    const guide = client.guild.channels.cache.find(c => c.type === "GUILD_TEXT" && c.name === "guide");
    const commands = client.guild.channels.cache.find(c => c.type === "GUILD_TEXT" && c.name === "commands");
    expect(initHooks).toHaveBeenCalledTimes(1);
    expect(client.guild.channels.create).toHaveBeenCalledTimes(2);
    expect(client.guild.channels.cache.length).toBe(2);
    expect(guide).toBeDefined();
    expect(commands).toBeDefined();
  });
});