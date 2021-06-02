const { client } = require("../src/index.js");
const { createChannelInCategory } = require("../src/util.js");
const { createCourse } = require("../src/courses.js");
// const { createCourse } = require("../src/commands/Faculty/init.js");
let mockUser = require("discord.js");
const token = process.env.BOT_TOKEN;

beforeAll(async () => {
  await client.login(token);
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

    await channel.delete();
    await category.delete();
  });
});

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

describe("Courses", () => {
  test("New cource can be created with correct channels", async () => {
    const testCourseName = "testcourse";

    mockUser = {
      roles: {
        highest: {
          name: "admin",
        },
      },
    };

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channelsAtStart = 0;
    await createCourse(mockUser, testCourseName);
    const createdCourseName = `📚 ${testCourseName}`;

    const category = guild.channels.cache.find(c => c.type === "category" && c.name === createdCourseName);
    const channelsAtMid = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    const categoryAnnouncement = guild.channels.cache.find(c => c.type === "text" && c.parent === category && c.name == `${testCourseName}_announcement`);
    const categoryGeneral = guild.channels.cache.find(c => c.type === "text" && c.parent === category && c.name == `${testCourseName}_general`);
    const categoryQuestions = guild.channels.cache.find(c => c.type === "text" && c.parent === category && c.name == `${testCourseName}_questions`);
    const categoryVoice = guild.channels.cache.find(c => c.type === "voice" && c.parent === category && c.name == `${testCourseName}_voice`);
    const courseRole = guild.roles.cache.find(role => role.name === testCourseName);
    const courseRoleAdmin = guild.roles.cache.find(role => role.name === `${testCourseName} admin`);

    expect(category.name).toBe(createdCourseName);
    expect(channelsAtMid).toBeGreaterThan(channelsAtStart);
    expect(channelsAtMid).toBe(channelsAtStart + 5);

    await categoryAnnouncement.delete();
    await categoryGeneral.delete();
    await categoryQuestions.delete();
    await categoryVoice.delete();
    await category.delete();
    await courseRole.delete();
    await courseRoleAdmin.delete();

    const channelsAtEnd = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(channelsAtEnd).toBe(channelsAtStart);
  });

  test("Student cannot create course", async () => {
    const testCourseName = "testcourse";

    mockUser = {
      roles: {
        highest: {
          name: "student",
        },
      },
    };

    try {
      await createCourse(mockUser, testCourseName);
    }
    catch(err) {
      expect(err.message).toMatch("You have no power here!");
    }
  });
});

afterAll(async () => {
  client.destroy();
  // avoid jest open handle error
  await new Promise(resolve => setTimeout(() => resolve(), 3000));
});