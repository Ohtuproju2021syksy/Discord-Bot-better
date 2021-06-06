const { client } = require("../src/index.js");
const { createChannelInCategory } = require("../src/service.js");

describe("channels", () => {
  test("channel is created in category", async () => {
    const channelName = "testikanava";
    const categoryName = "testikategoria";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
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