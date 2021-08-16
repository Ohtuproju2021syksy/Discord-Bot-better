let discordClient;
let telegramClient;

const validDiscordChannel = async (courseName) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  courseName = courseName.replace(/ /g, "-");
  const channel = guild.channels.cache.find(
    c => c.name === `${courseName}_general`,
  );
  // temp - create webhook for existing bridged channels
  if (!channel) return;
  const webhooks = await channel.fetchWebhooks();
  if (!webhooks.size) await channel.createWebhook(courseName, { avatar: "https://cdn.discordapp.com/embed/avatars/1.png" }).catch(console.error);
  // --
  return channel;
};

// Create user
const createDiscordUser = async (ctx) => {
  const username = ctx.message.from.first_name || ctx.message.from.username;
  let url;
  const t = await telegramClient.telegram.getUserProfilePhotos(ctx.message.from.id);
  if (t.photos.length) url = await telegramClient.telegram.getFileLink(t.photos[0][0].file_id);
  const user = { username: username, avatarUrl: url };
  return user;
};


// Send message methods
const sendMessageToDiscord = async (message, channel) => {
  try {
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();

    if (message.content.text) {
      await webhook.send({
        content: message.content.text,
        username: message.user.username,
        avatarURL: message.user.avatarUrl,
      });
    }

    if (message.content.photo) {
      await webhook.send({
        content: message.content.photo.caption,
        username: message.user.username,
        avatarURL: message.user.avatarUrl,
        files: [message.content.photo.url],
      });
    }
  }
  catch (error) {
    console.error("Error trying to send a message: ", error);
  }
};

const handleBridgeMessage = async (message, courseName, Course) => {
  if (!message.channel.parent) return;
  // const channelName = message.channel.name;

  const group = await Course.findOne({ where: { name: String(courseName) } });

  if (!group) {
    return;
  }
  if (message.author.bot) return;

  const sender = message.member.nickname || message.author.username;

  /* let channel = "";
  const name = courseName.replace(/ /g, "-");
  channel = channelName === `${name}_announcement` ? " announcement" : channel;
  channel = channelName === `${name}_general` ? " general" : channel;*/

  let msg;
  if (message.content.includes("<@!")) {
    const userID = message.content.match(/(?<=<@!).*?(?=>)/)[0];
    let user = message.guild.members.cache.get(userID);
    user ? user = user.user.username : user = "Jon Doe";
    msg = message.content.replace(/<.*>/, `${user}`);
  }
  else {
    msg = message.content;
  }

  // Handle content correctly
  const photo = message.attachments.first();
  const gif = message.embeds[0];
  if (photo) {
    await sendPhotoToTelegram(group.groupId, msg, sender, photo.url);
  }
  else if (gif) {
    await sendAnimationToTelegram(group.groupId, sender, gif.video.url);
  }
  else {
    await sendMessageToTelegram(group.groupId, msg, sender);
  }
};

const escapeChars = (content) => {
  return content
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/-/g, "\\-")
    .replace(/=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/!/g, "\\!");
};

const validateContent = (content) => {
  const regexp = /^`((.|\n)*)`$/;
  if (!regexp.test(content)) content = escapeChars(content);
  return content;
};

const sendMessageToTelegram = async (groupId, content, sender) => {
  content = validateContent(content);
  sender ?
    await telegramClient.telegram.sendMessage(groupId, `*${sender}:*\n ${content}`, { parse_mode: "MarkdownV2" }) :
    await telegramClient.telegram.sendMessage(groupId, `${content}`, { parse_mode: "MarkdownV2" });
};

const sendPhotoToTelegram = async (groupId, info, sender, url) => {
  info = validateContent(info);
  const caption = `*${sender}:* ${info}`;
  await telegramClient.telegram.sendPhoto(groupId, { url }, { caption, parse_mode: "MarkdownV2" });
};

const sendAnimationToTelegram = async (groupId, sender, url) => {
  sender = validateContent(sender);
  const caption = `*${sender}*`;
  await telegramClient.telegram.sendAnimation(groupId, { url }, { caption, parse_mode: "MarkdownV2" });
};

const createNewGroup = async (args, Groups) => {
  const courseName = args[0];
  const groupId = args[1];
  await Groups.create({ groupId: groupId, course: courseName });
};

const getCourseName = (categoryName) => {
  let cleaned = null;
  if (categoryName.includes("📚")) {
    cleaned = categoryName.replace("📚", "").trim();
  }
  else {
    cleaned = categoryName.replace("🔒", "").trim();
  }
  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(cleaned);
  return matches?.[1] || cleaned;
};

const initService = (dclient, tClient) => {
  discordClient = dclient;
  telegramClient = tClient;
};

module.exports = {
  initService,
  validDiscordChannel,
  createDiscordUser,
  sendMessageToDiscord,
  sendMessageToTelegram,
  sendPhotoToTelegram,
  createNewGroup,
  sendAnimationToTelegram,
  handleBridgeMessage,
  getCourseName,
};