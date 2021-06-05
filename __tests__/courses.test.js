let mockUser = require("discord.js");
const { createCourse } = require("../src/commands/Faculty/create");
const { client } = require("../src/index.js");

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
    await createCourse(mockUser, testCourseName, guild);
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

  test("New cource can be multi argument", async () => {
    const testCourseName = "testcourse summer";
    const testCourseTextChannelName = "testcourse-summer";

    mockUser = {
      roles: {
        highest: {
          name: "admin",
        },
      },
    };

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channelsAtStart = 0;
    await createCourse(mockUser, testCourseName, guild);
    const createdCourseName = `📚 ${testCourseName}`;

    const category = guild.channels.cache.find(c => c.type === "category" && c.name === createdCourseName);
    const channelsAtMid = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    const categoryAnnouncement = guild.channels.cache.find(c => c.type === "text" && c.parent === category && c.name == `${testCourseTextChannelName}_announcement`);
    const categoryGeneral = guild.channels.cache.find(c => c.type === "text" && c.parent === category && c.name == `${testCourseTextChannelName}_general`);
    const categoryQuestions = guild.channels.cache.find(c => c.type === "text" && c.parent === category && c.name == `${testCourseTextChannelName}_questions`);
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
    catch (err) {
      expect(err.message).toMatch("You have no power here!");
    }
  });
});