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
});