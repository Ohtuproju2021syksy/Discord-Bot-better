const { initService, handleBridgeMessage, getCourseName } = require("./service");
const { Groups } = require("../db/dbInit");

const startBridge = (discordClient, telegramClient) => {
  initService(discordClient, telegramClient);
  discordClient.on("message", async message => {
    if (!message.channel.parent) return;

    const courseName = getCourseName(message.channel.parent.name);
    return await handleBridgeMessage(message, courseName, Groups);
  });
  console.log("Bridge started");
};

module.exports = {
  startBridge,
};
