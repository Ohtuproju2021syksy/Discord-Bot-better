const { group, test, beforeStart, afterAll, expect } = require("corde");

const { client, login } = require("../index.js");

beforeStart(async () => {
  await login();
});

group("main commands", () => {
  test("help command should react with a checkmark", () => {
    expect("help").toAddReaction(["✅"]);
  });
});

afterAll(() => {
  client.destroy();
});