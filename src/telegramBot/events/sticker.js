const { createDiscordUser, validDiscordChannel, sendMessageToDiscord } = require("../../bridge/service");

const execute = async (ctx, message, telegramClient, Groups) => {
  const id = ctx.message.chat.id;
  const group = await Groups.findOne({ where: { groupId: String(id) } });
  if (!group) {
    return;
  }
  const url = await telegramClient.telegram.getFileLink(ctx.message.sticker.thumb.file_id);
  const courseName = group.course;
  if (String(ctx.message.chat.id) === group.groupId) {
    const discordUser = await createDiscordUser(ctx);
    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    const msg = { user: discordUser, content: { photo: { url: url.href, caption: ctx.message.caption } } };
    return await sendMessageToDiscord(msg, channel);
  }
};

module.exports = {
  name: "sticker",
  execute,
};