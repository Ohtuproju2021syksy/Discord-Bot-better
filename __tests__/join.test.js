const { client } = require("../src/index.js");
const { execute } = require("../src/events/message");

const { joinMessage, joinMessageWithArgsAndRoles } = require("./mocks.js");

afterEach(() => {
  jest.clearAllMocks();
});

describe("join command", () => {
  test("join without roles", async () => {
    await execute(joinMessage, client);
    try {
      expect(joinMessage.channel.send).toHaveBeenCalledTimes(1);
    }
    catch(err) {
      expect(err).toBeDefined();
    }
  });
  test("join with roles and args", async () => {
    await execute(joinMessageWithArgsAndRoles, client);
    expect(joinMessageWithArgsAndRoles.react).toHaveBeenCalledWith("✅");
  });
});