const { createDiscordUser, validDiscordChannel, sendMessageToDiscord } = require("../../bridge/service");
const { logError } = require("../../discordBot/services/logger");

const execute = async (ctx, message, telegramClient, Course) => {
  const id = ctx.message.chat.id;
  const group = await Course.findOne({ where: { telegramId: String(id) } });
  if (!group) {
    return;
  }
  let url;
  try {
    url = await telegramClient.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1]);
  }
  catch (error) {
    logError(error);
  }

  const courseName = group.name;
  if (String(ctx.message.chat.id) === group.telegramId) {
    const discordUser = await createDiscordUser(ctx);
    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    let msg;
    if (url) {
      msg = { user: discordUser, content: { photo: { url: url.href, caption: ctx.message.caption } } };
    }
    else {
      msg = { user: discordUser, content: { text: ctx.message.caption } };
    }
    return await sendMessageToDiscord(ctx, msg, channel);
  }
};

module.exports = {
  name: "photo",
  execute,
};