const env = require("dotenv");
const { testFilesDir, testTimeOut } = require("./config.json");

const result = env.config();

// Do not throw any error if the project in running inside CI.
if (!process.env.CI && result.error) {
  throw result.error;
}

const botPrefix = process.env.PREFIX;
const botTestId = process.env.BOT_TEST_ID;
const channelId = process.env.CHANNEL_ID;
const cordeBotToken = process.env.CORDE_BOT_TOKEN;
const guildId = process.env.GUILD_ID;
const testMatches = [testFilesDir];
const botToken = process.env.BOT_TOKEN;
const timeOut = testTimeOut;

module.exports = {
  botPrefix,
  botTestId,
  channelId,
  cordeBotToken,
  guildId,
  botToken,
  testMatches,
  timeOut,
};