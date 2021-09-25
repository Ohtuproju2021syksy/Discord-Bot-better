let discordClient;
let telegramClient;
const keywords = ["crypto", "krypto", "btc", "doge", "btc", "eth", "musk", "money", "$", "usd", "bitcoin", "muskx.co", "coin", "elonmusk", "prize", "еlonmusk", "btc"];
const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
const keywordPoints = new Map(keywords.map(key => [key, null]));


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
  const userId = ctx.message.from.username || "undefined";
  let url;
  const t = await telegramClient.telegram.getUserProfilePhotos(ctx.message.from.id);
  if (t.photos.length) url = await telegramClient.telegram.getFileLink(t.photos[0][0].file_id);
  const user = { username: username, avatarUrl: url, userId: userId };
  return user;
};

const sendMessageToDiscord = async (message, channel) => {
  try {
    if (message.content.text && message.content.text.length > 2000) {
      console.log("Message is too long (over 2000 characters)");
      return;
    }
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();
    if (message.content.text) {
      if (isMessageCryptoSpam(message)) {
        console.log("Crypto spam detected, message blocked (Either too many keywords and/or userID has bot in it)");
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

  let point = 0;
  const userId = message.user.userId.toLowerCase();
  const textAsList = message.content.text.toLowerCase().split(/(?: |\n)+/);

  for (const c of message.content.text) {
    if (cyrillicPattern.test(c)) {
      point++;
      break;
    }
  }

  userId.includes("bot") ? point = point + 2 : point = point + 0;
  message.content.text.includes("elonmusk") ? point++ : point = point + 0;
  cyrillicPattern.test(message.content.text) ? point++ : point = point + 0;
  if (point == 3) return true;
  for (const word of textAsList) {
    if (keywordPoints.has(word)) {
      point++;
      if (point == 3) return true;
    }
  }

  return false;
};


const handleBridgeMessage = async (message, courseName, Course) => {
  if (!message.channel.parent) return;

  const group = await Course.findOne({ where: { name: String(courseName) } });

  if (!group || group.telegramId == null) {
    return;
  }

  if (message.author.bot) return;

  const sender = message.member.displayName;
  let channel = ":";

  if (!message.channel.name.includes("general")) {
    channel = " on " + message.channel.name.split("_")[1] + " channel:\n";
  }

  let msg = message.content;

  while (msg.includes("<#")) {
    const channelID = msg.match(/(?<=<#).*?(?=>)/)[0];
    let channelName = message.guild.channels.cache.get(channelID);
    channelName ? channelName = channelName.name : channelName = "UnknownChannel";
    msg = msg.replace("<#" + channelID + ">", "#" + channelName);
  }

  while (msg.includes("<@!")) {
    const userID = msg.match(/(?<=<@!).*?(?=>)/)[0];
    let userName = message.guild.members.cache.get(userID);
    userName ? userName = userName.user.name : userName = "Jon Doe";
    msg = msg.replace("<@!" + userID + ">", userName);
  }

  const media = message.attachments.first();
  const gif = message.embeds[0];


  if (media) {
    await sendMediaToTelegram(group.telegramId, msg, sender, channel, media);
  }
  else if (gif != undefined && gif.type != undefined && gif.type == "gifv") {
    await sendAnimationToTelegram(group.telegramId, sender, channel, gif.video.url);
  }
  else {
    await sendMessageToTelegram(group.telegramId, msg, sender, channel);
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

const sendMessageToTelegram = async (telegramId, content, sender, channel) => {
  sender ? escapeChars(sender) : null;
  content = validateContent(content);
  sender ?
    await telegramClient.telegram.sendMessage(telegramId, `*${sender}*${channel}\n${content}`, { parse_mode: "MarkdownV2" }) :
    await telegramClient.telegram.sendMessage(telegramId, `${content}`, { parse_mode: "MarkdownV2" });
};

const sendMediaToTelegram = async (telegramId, info, sender, channel, media) => {
  sender = escapeChars(sender);
  info = validateContent(info);
  const url = media.url;
  const caption = `*${sender}*${channel} ${info}`;
  console.log(media.contentType);
  if (media.contentType.includes("video")) {
    await telegramClient.telegram.sendVideo(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
  }
  else if (media.contentType.includes("audio")) {
    await telegramClient.telegram.sendAudio(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
  }
  else if (media.contentType.includes("gif")) {
    await telegramClient.telegram.sendAnimation(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
  }
  else if (media.contentType.includes("image") || media.contentType.includes("pdf")) {
    console.log(media.contentType);
    await telegramClient.telegram.sendPhoto(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
  }

};

const sendAnimationToTelegram = async (telegramId, sender, channel, url) => {
  sender = escapeChars(sender);
  const caption = `*${sender}*${channel}`;
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
  sendMediaToTelegram,
  sendAnimationToTelegram,
  handleBridgeMessage,
  getCourseName,
};