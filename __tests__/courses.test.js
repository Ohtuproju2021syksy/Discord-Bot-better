let mockUser = require("discord.js");
const create = require("../src/commands/faculty/create.js");
const remove = require("../src/commands/faculty/remove.js");
const { client } = require("../src/index.js");

const mockCreate = async (mockUser, testCourseName, guild) => {
  const message = {
    guild,
    member: mockUser,
  };
  await create.execute(message, testCourseName);
};

const mockRemove = async (mockUser, testCourseName, guild) => {
  const message = {
    guild,
    member: mockUser,
  };
  await remove.execute(message, testCourseName);
};

describe("Courses", () => {
  test("New cource can be created with correct channels", async () => {
    const testCourseName = "testcourse";

    mockUser = {
      roles: {
        cache: {
          find: (role) => "teacher",
        }
      },
    };

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channelsAtStart = 0;
    await mockCreate(mockUser, testCourseName, guild);
    const createdCourseName = `📚 ${testCourseName}`;
    const category = guild.channels.cache.find(c => c.type === "category" && c.name === createdCourseName);
    const channelsAtMid = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(category.name).toBe(createdCourseName);
    expect(channelsAtMid).toBeGreaterThan(channelsAtStart);
    expect(channelsAtMid).toBe(channelsAtStart + 5);

    await mockRemove(mockUser, testCourseName, guild);

    const channelsAtEnd = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(channelsAtEnd).toBe(channelsAtStart);
  });

  test("New cource can be multi argument", async () => {
    const testCourseName = "testcourse summer";

    mockUser = {
      roles: {
        cache: {
          find: (role) => "teacher",
        }
      },
    };

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channelsAtStart = 0;
    await mockCreate(mockUser, testCourseName, guild);
    const createdCourseName = `📚 ${testCourseName}`;

    const category = guild.channels.cache.find(c => c.type === "category" && c.name === createdCourseName);
    const channelsAtMid = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(category.name).toBe(createdCourseName);
    expect(channelsAtMid).toBeGreaterThan(channelsAtStart);
    expect(channelsAtMid).toBe(channelsAtStart + 5);

    await mockRemove(mockUser, testCourseName, guild);

    const channelsAtEnd = guild.channels.cache.map(c => ((c.type === "text" || c.type === "voice") && c.parent === category) || c === category).reduce((sum, channel) => sum + channel, 0);

    expect(channelsAtEnd).toBe(channelsAtStart);
  });

  test("Student cannot create course", async () => {
    const testCourseName = "testcourse";
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    mockUser = {
      roles: {
        cache: {
          find: (role) => "student",
        }
      },
    };

    try {
      await mockCreate(mockUser, testCourseName, guild);
    }
    catch (err) {
      expect(err.message).toMatch("You have no power here!");
    }
  });
});
