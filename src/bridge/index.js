const { initService, handleBridgeMessage, getCourseName } = require("./service");
const { findChannelFromDbByName } = require('../discordBot/services/service')
const models = require("../db/dbInit");

const startBridge = async (discordClient, telegramClient) => {
  initService(discordClient, telegramClient);
  discordClient.on("messageCreate", async message => {
    if (!message.channel.parent) return;
    
    const channel = await findChannelFromDbByName(message.channel.name, models.Channel);
    
    if (channel && !channel.bridged) {
      return;
    }
    const courseName = getCourseName(message.channel.parent.name);
    return await handleBridgeMessage(message, courseName, models.Course);
  });
  console.log("Bridge started");
};

module.exports = {
  startBridge,
};
