const { client } = require("../src/index.js");

const { createChannelInCategory, testi } = require("../src/service.js");

describe("channels", () => {
  test.only("channel is created in category", async () => {
    testi();
    const channelName = "testikanava";
    const categoryName = "testikategoria";
    const guild = client.guilds;
    const channel = await createChannelInCategory(guild, channelName, categoryName);
    const category = guild.channels.cache.find(c => c.type === "category" && c.name === categoryName);
    const createdChannelName = channel.name;
    const createCategoryName = category.name;

    expect(createdChannelName).toBe(channelName);
    expect(createCategoryName).toBe(categoryName);

    await channel.delete();
    await category.delete();
  });
});