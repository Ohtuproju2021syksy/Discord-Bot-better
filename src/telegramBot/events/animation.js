const { createDiscordUser, validDiscordChannel, sendMessageToDiscord } = require("../bridge/service");
const { getCourseByTelegramId } = require("../../db/services/courseService");

const execute = async (ctx, message, telegramClient, Course) => {
  const id = ctx.message.chat.id;
  const group = await getCourseByTelegramId(String(id), Course);
  if (!group) {
    return;
  }
  const url = await telegramClient.telegram.getFileLink(ctx.message.animation.file_id);
  const courseName = group.name;
  if (String(ctx.message.chat.id) === group.telegramId) {
    const discordUser = await createDiscordUser(ctx);
    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    const msg = { user: discordUser, content: { photo: { url: url.href } } };
    return await sendMessageToDiscord(ctx, msg, channel);
  }
};

module.exports = {
  name: "animation",
  execute,
};