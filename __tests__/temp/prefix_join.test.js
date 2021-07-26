const { execute } = require("../../src/discordBot/commands/student/join");

const { joinMessage } = require("../temp/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix join command", () => {
  test("join to invalid course throws error", async () => {
    try {
      await execute(joinMessage, "test");
    }
    catch (error) {
      expect(error).toBeDefined();
    }
  });
  test("join valid course adds role", async () => {
    joinMessage.guild.roles.cache.push({ name: "test" });
    const member = joinMessage.member;
    await execute(joinMessage, "test");
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(member.fetch).toHaveBeenCalledTimes(1);
  });
});