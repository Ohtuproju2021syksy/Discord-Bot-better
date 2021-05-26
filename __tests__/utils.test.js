const { client, login } = require("../src/index.js");
const { createChannelInCategory } = require("../src/util");

beforeAll(async () => {
  return await login();
});

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

    channel.delete();
    category.delete();
  });
});

afterAll(async () => {
  client.destroy();
  // avoid jest open handle error
  await new Promise(resolve => setTimeout(() => resolve(), 500));
});