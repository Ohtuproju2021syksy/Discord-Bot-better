const { createDiscordUser, validDiscordChannel, sendMessageToDiscord } = require("../../bridge/service");

const execute = async (ctx, message, telegramClient, Groups, Course) => {
  const id = ctx.message.chat.id;
  const group = await Course.findOne({ where: { telegramId: String(id) } });
  if (!group) {
    return;
  }
  const url = await telegramClient.telegram.getFileLink(ctx.message.animation.file_id);
  const courseName = group.course;
  if (String(ctx.message.chat.id) === group.groupId) {
    const discordUser = await createDiscordUser(ctx);
    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    const msg = { user: discordUser, content: { photo: { url: url.href } } };
    return await sendMessageToDiscord(msg, channel);
  }
};

module.exports = {
  name: "animation",
  execute,
};