const { group, test, beforeStart, afterAll, expect } = require("corde");
const { client, login } = require("../../src/index.js");

const getCordebot = async () => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const cordeBot = await guild.members.fetch(process.env.CORDE_BOT_ID);
  return cordeBot;
};

beforeStart(async () => {
  await login();
});

group("main commands", () => {
  test("help command should react with a checkmark", async () => {
    expect("help").toAddReaction(["✅"]);
  });
  test("help command should show all commands to a teacher", async () => {
    const cordeBot = await getCordebot();
    cordeBot
      .expect("help").toMessageContentContains("!create - Create new course");
  });
  // test("join command with unknown course should react with x", () => {
  //   expect("join test").toAddReaction(["❌"]);
  // });
  // test("leave command with unknown course should react with a x", () => {
  //   expect("leave test").toAddReaction(["❌"]);
  // });
  // test("init command should react with a checkmark", () => {
  //   expect("create test").toAddReaction(["✅"]);
  // });
  // test("join command should react with a checkmark", () => {
  //   expect("join test").toAddReaction(["✅"]);
  // });
  // test("leave command should react with a checkmark", () => {
  //   expect("leave test").toAddReaction(["✅"]);
  // });
  // test("delete command should react with a checkmark", () => {
  //   expect("delete test").not.toAddReaction(["❌"]);
  // });
});

afterAll(() => {
  client.destroy();
});