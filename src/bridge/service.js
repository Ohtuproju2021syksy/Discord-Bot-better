let discordClient;
let telegramClient;

const validDiscordChannel = async (courseName) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  courseName = courseName.replace(/ /g, "-");
  const channel = guild.channels.cache.find(
    c => c.name === `${courseName}_general`,
  );
  return channel;
};

const createDiscordUser = async (ctx) => {
  const username = ctx.message.from.first_name || ctx.message.from.username;
  const userId = ctx.message.from.username || 'undefined';
  let url;
  const t = await telegramClient.telegram.getUserProfilePhotos(ctx.message.from.id);
  if (t.photos.length) url = await telegramClient.telegram.getFileLink(t.photos[0][0].file_id);
  const user = { username: username, avatarUrl: url, userId: userId};
  return user;
};

const sendMessageToDiscord = async (message, channel) => {
  try {
    if (message.content.text.length > 2000) {
      console.log("Message is too long (over 2000 characters)");
      return;
    }
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();
    if (message.content.text) {
      if (isMessageCryptoSpam(message)) {
        console.log("Crypto spam detected, message blocked (Either too many keywords and/or userID has bot");
        return;
      }
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

const isMessageCryptoSpam = (message) => {
  
  var keywords = ['crypto', 'krypto', 'btc', 'doge', 'btc', 'eth', 'musk', 'money', '$', 'usd', 'bitcoin', 'muskx.co', 'coin']
  const keywordPoints = new Map(keywords.map(key => [key, null]));
  let point;
  const userId = message.user.userId.toLowerCase();
  const textAsList = message.content.text.toLowerCase().split(" ");

  userId.includes("bot") ? point = 2 : point = 0;
  for (const word of textAsList) {
    if (keywordPoints.has(word)) {
      point++;
      if (point == 3) return true;
    }
  }

  return false;

}


const handleBridgeMessage = async (message, courseName, Course) => {
  if (!message.channel.parent) return;

  const group = await Course.findOne({ where: { name: String(courseName) } });

  if (!group) {
    return;
  }
  if (message.author.bot) return;

  const sender = message.member.displayName;

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

  const photo = message.attachments.first();
  const gif = message.embeds[0];
  if (photo) {
    await sendPhotoToTelegram(group.telegramId, msg, sender, photo.url);
  }
  else if (gif) {
    await sendAnimationToTelegram(group.telegramId, sender, gif.video.url);
  }
  else {
    await sendMessageToTelegram(group.telegramId, msg, sender);
  }
};

const escapeChars = (content) => {
  return content
    .replace(/\\/g, "\\\\")
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

const sendMessageToTelegram = async (telegramId, content, sender) => {
  sender ? escapeChars(sender) : null;
  content = validateContent(content);
  sender ?
    await telegramClient.telegram.sendMessage(telegramId, `*${sender}:*\n ${content}`, { parse_mode: "MarkdownV2" }) :
    await telegramClient.telegram.sendMessage(telegramId, `${content}`, { parse_mode: "MarkdownV2" });
};

const sendPhotoToTelegram = async (telegramId, info, sender, url) => {
  sender = escapeChars(sender);
  info = validateContent(info);
  const caption = `*${sender}:* ${info}`;
  await telegramClient.telegram.sendPhoto(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
};

const sendAnimationToTelegram = async (telegramId, sender, url) => {
  sender = escapeChars(sender);
  const caption = `*${sender}*`;
  await telegramClient.telegram.sendAnimation(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
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
  sendAnimationToTelegram,
  handleBridgeMessage,
  getCourseName,
};