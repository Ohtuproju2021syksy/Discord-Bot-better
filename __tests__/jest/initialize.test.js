const { initializeApplicationContext } = require("../../src/discordBot/services/init");

jest.mock("../../src/discordBot/services/service");

const client = {
  user: {
    id: 1,
  },
  guild: {
    channels: {
      cache: [],
      create: jest.fn((name) => client.guild.channels.cache.push({
        name: name, type: "text",
        send: jest.fn((content) => { return { content: content, pin: jest.fn() }; }),
        lastPinTimestamp: null,
        createInvite: jest.fn(),
      })),
    },
    roles: {
      cache: [],
      create: jest.fn(),
    },
    fetchInvites: jest.fn(() => []),
  },
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("Initialize", () => {
  test("After initialization guide and commands channels found", async () => {
    await initializeApplicationContext(client);
    const guide = client.guild.channels.cache.find(c => c.type === "text" && c.name === "guide");
    const commands = client.guild.channels.cache.find(c => c.type === "text" && c.name === "commands");
    expect(client.guild.channels.create).toHaveBeenCalledTimes(2);
    expect(client.guild.channels.cache.length).toBe(2);
    expect(guide).toBeDefined();
    expect(commands).toBeDefined();
  });
});