const { group, test, beforeStart, afterAll, expect } = require("corde");
const { client, login } = require("../../src/index.js");

// const getGuild = async () => {
//   const guild = await client.guilds.fetch(process.env.GUILD_ID);
//   return guild;
// };

// const getCordebot = async (guild) => {
//   const cordeBot = await guild.members.fetch(process.env.CORDE_BOT_ID);
//   return cordeBot;
// };

// const getRole = async (guild, roleToFind) => {
//   const roleFound = guild.roles.cache.find(role => role.name === roleToFind);
//   return roleFound;
// };

beforeStart(async () => {
  await login();
});

group("main commands", () => {
  // test("help command should react with a checkmark", async () => {
  //   expect("help").toAddReaction(["✅"]);
  // });
  // test("join command with unknown course should react with x", () => {
  //   expect("join test").toAddReaction(["❌"]);
  // });
  // test("leave command with unknown course should react with a x", () => {
  //   expect("leave test").toAddReaction(["❌"]);
  // });
  test("init command should react with a checkmark", () => {
    expect("create test").toAddReaction(["✅"]);
  });
  test("join command should react with a checkmark", () => {
    expect("join test").toAddReaction(["✅"]);
  });
  test("leave command should react with a checkmark", () => {
    expect("leave test").toAddReaction(["✅"]);
  });
  test("delete command should react with a checkmark", () => {
    expect("remove test").not.toAddReaction(["❌"]);
  });
});

// group("help command", async () => {
//   const guild = await getGuild();
//   const cordeBot = await getCordebot(guild);
//   const teacherRole = await getRole(guild, "teacher");
//   const studentRole = await getRole(guild, "student");

//   test("should show create course to a teacher", async () => {
//     await cordeBot.roles.add(teacherRole);
//     await cordeBot.roles.remove(studentRole);
//     expect("help").toMessageContentContains("!create - Create new course");
//   });

//   test("should not show create course to a student", async () => {
//     await cordeBot.roles.add(studentRole);
//     await cordeBot.roles.remove(teacherRole);
//     expect("help").not.toMessageContentContains("!create - Create new course");
//   });
// });

afterAll(() => {
  client.destroy();
});