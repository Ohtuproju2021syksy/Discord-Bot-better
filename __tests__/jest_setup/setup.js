const fs = require("fs");
const { client } = require("../../src/index.js");
const BOT_TOKEN = process.env.BOT_TOKEN;

beforeAll(async () => {
  await client.login(BOT_TOKEN);
});

// Find all test files in __tests__ root
const testFolder = fs.readdirSync("./__tests__/");

for (const file of testFolder) {
  file.endsWith(".js") && require(`../${file}`);
}

afterAll(async () => {
  client.destroy();
  // avoid jest open handle error
  await new Promise(resolve => setTimeout(() => resolve(), 3000));
});