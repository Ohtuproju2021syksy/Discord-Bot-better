let mockUser = require("discord.js");
const { createCourse } = require("../src/commands/faculty/create.js");
const { deleteCourse } = require("../src/commands/faculty/delete.js");
const { client } = require("../src/index.js");

describe("Courses", () => {
  test("New cource can be created with correct channels", async () => {
    const testCourseName = "testcourse";

    mockUser = {
      roles: {
        highest: {
          name: "teacher",
        },
      },
    };

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channelsAtStart = 0;
    await createCourse(mockUser, testCourseName, guild);
    const createdCourseName = `📚 ${testCourseName}`;
    const category = guild.channels.cache.find(c => c.type === "category" && c.name === createdCourseName);
    const channelsAtMid = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(category.name).toBe(createdCourseName);
    expect(channelsAtMid).toBeGreaterThan(channelsAtStart);
    expect(channelsAtMid).toBe(channelsAtStart + 5);

    await deleteCourse(mockUser, testCourseName, guild);

    const channelsAtEnd = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(channelsAtEnd).toBe(channelsAtStart);
  });

  test("New cource can be multi argument", async () => {
    const testCourseName = "testcourse summer";

    mockUser = {
      roles: {
        highest: {
          name: "teacher",
        },
      },
    };

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channelsAtStart = 0;
    await createCourse(mockUser, testCourseName, guild);
    const createdCourseName = `📚 ${testCourseName}`;

    const category = guild.channels.cache.find(c => c.type === "category" && c.name === createdCourseName);
    const channelsAtMid = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(category.name).toBe(createdCourseName);
    expect(channelsAtMid).toBeGreaterThan(channelsAtStart);
    expect(channelsAtMid).toBe(channelsAtStart + 5);

    await deleteCourse(mockUser, testCourseName, guild);

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