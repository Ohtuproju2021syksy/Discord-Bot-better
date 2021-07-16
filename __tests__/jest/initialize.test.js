const { initializeApplicationContext } = require("../../src/discordBot/services/init");

jest.mock("../../src/discordBot/services/service");

const { client } = require("../temp/mockClient");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Initialize", () => {
  test("After initialization channels correct channels and roles found", async () => {
    client.guild.roles.cache.push({ id: 0, name: "admin" });
    await initializeApplicationContext(client);
    const guide = client.guild.channels.cache.find(c => c.type === "text" && c.name === "guide");
    const commands = client.guild.channels.cache.find(c => c.type === "text" && c.name === "commands");
    expect(client.guild.channels.create).toHaveBeenCalledTimes(2);
    expect(client.guild.channels.cache.length).toBe(2);
    expect(guide).toBeDefined();
    expect(commands).toBeDefined();
  });
});