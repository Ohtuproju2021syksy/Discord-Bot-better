const { group, test, beforeStart, afterAll, expect } = require("corde");
const { client, login } = require("../../src/index.js");
const courseName = "test course";

beforeStart(async () => {
  await login();
});

group("main commands", () => {
  test("help command should react with a checkmark", () => {
    expect("help").toAddReaction(["✅"]);
  });
  test("help command with invalid arguments should reply invalid command", () => {
    expect("help test").toMessageContentContains("that's not a valid command!");
  });
  test("help command with valid argument should reply command info", () => {
    expect("help join").toMessageContentContains("**Description:** Join to the course.");
  });
  test("join command with unknown course should react with x", () => {
    expect("join test").toAddReaction(["❌"]);
  });
  test("leave command with unknown course should react with a x", () => {
    expect("leave test").toAddReaction(["❌"]);
  });
  test("create command should react with a checkmark", () => {
    expect(`create ${courseName}`).toAddReaction(["✅"]);
  });
  test("courses command should react with a checkmark", () => {
    expect("courses").toAddReaction(["✅"]);
  });
  test("courses command should reply with message containing course name", () => {
    expect("courses").toMessageContentContains(`${courseName}`);
  });
  test("courses command should reply with message containing join command", () => {
    expect("courses").toMessageContentContains(`!join ${courseName}`);
  });
  test("join command should react with a checkmark", () => {
    expect(`join ${courseName}`).toAddReaction(["✅"]);
  });
  test("leave command should react with a checkmark", () => {
    expect(`leave ${courseName}`).toAddReaction(["✅"]);
  });
  test("remove command should react with a checkmark", () => {
    expect(`remove ${courseName}`).not.toAddReaction(["❌"]);
  });
});

afterAll(() => {
  client.destroy();
});