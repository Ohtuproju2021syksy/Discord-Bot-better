const fs = require("fs");
const { client } = require("../../src/index.js");
const { sequelize } = require("../../src/dbInit");
const server = require("../../src/server/index");
const BOT_TOKEN = process.env.BOT_TOKEN;

beforeAll(async () => {
  jest.setTimeout(10000);
  await client.login(BOT_TOKEN);
});

// Find all test files in __tests__ root
const testFolder = fs.readdirSync("./__tests__/");

for (const file of testFolder) {
  file.endsWith(".js") && require(`../${file}`);
}

afterAll(async () => {
  try {
    server.close();
    console.log("Server connection closed successfully.");
  }
  catch (error) {
    console.error("Unable to connect to the server:", error);
  }
  try {
    await sequelize.close();
    console.log("DB connection closed successfully.");
  }
  catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  client.destroy();
  // avoid jest open handle error
  await new Promise(resolve => setTimeout(() => resolve(), 3000));
});