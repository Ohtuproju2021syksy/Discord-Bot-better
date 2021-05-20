const env = require("dotenv");
const { commandPrefix, testFilesDir, testTimeOut } = require("./config.json")

var result = env.config();

// Do not throw any error if the project in running inside CI.
if (!process.env.CI && result.error) {
    throw result.error;
}

const botPrefix = commandPrefix;
const botTestId = process.env.BOT_TEST_ID; // id of bot to test
const channelId = process.env.CHANNEL_ID;
const cordeBotToken = process.env.CORDE_BOT_TOKEN; // bot sending test commands
const guildId = process.env.GUILD_ID;
const testMatches = [testFilesDir];
const botToken = process.env.BOT_TOKEN; // bot to test
const timeOut = testTimeOut

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