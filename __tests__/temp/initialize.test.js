const { client } = require("../src/index.js");

describe("Initialize", () => {
  test("found command channel", async () => {
    const channelName = "commands";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const foundChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
    expect(foundChannel.name).toBe(channelName);
  });

  test("found guide channel", async () => {
    const channelName = "guide";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const foundChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
    expect(foundChannel.name).toBe(channelName);
  });

  test("bot has permission to send messages on guide channel", async () => {
    const channelName = "guide";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const foundChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
    const permission = foundChannel.permissionsFor(process.env.BOT_TEST_ID).has(["SEND_MESSAGES"]);
    expect(permission).toBe(true);
  });

  test("guild member has not permission to send messages on guide channel", async () => {
    const channelName = "guide";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const foundChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
    const permission = foundChannel.permissionsFor(guild.id).has(["SEND_MESSAGES"]);
    expect(permission).toBe(false);
  });

  test("guide channel has pinned message", async () => {
    const channelName = "guide";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const foundChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
    const pinned = await foundChannel.messages.fetchPinned().then(arr => arr.first().pinned);
    expect(pinned).toBe(true);
  });
});