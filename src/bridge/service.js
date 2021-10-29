const { sendErrorReportNoInteraction } = require("../discordBot/services/message");
let discordClient;
let telegramClient;
const keywords = ["crypto", "krypto", "btc", "doge", "btc", "eth", "musk", "money", "$", "usd", "bitcoin", "muskx.co", "coin", "elonmusk", "prize", "еlonmusk", "btc", "cash", "million",
  "interest", "investment", "join"];
const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
const { findCourseFromDb } = require("../discordBot/services/service");


const validDiscordChannel = async (courseName) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  courseName = courseName.replace(/ /g, "-").toLowerCase();
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

const sendMessageToDiscord = async (ctx, message, channel) => {
  try {
    if (message.content.text && message.content.text.length > 2000) {
      console.log("Message is too long (over 2000 characters)");
      return;
    }
    if (message.content.text && message.content.text[0] === "/") {
      return;
    }
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();
    if (message.content.text) {
      if (isMessageCryptoSpam(message)) {
        console.log("Crypto spam detected, message deleted (Either too many keywords and/or userID has bot in it)");
        deleteMessage(ctx);
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

    if (message.content.audio) {
      await webhook.send({
        content: message.content.audio.caption,
        username: message.user.username,
        avatarURL: message.user.avatarUrl,
        files: [message.content.audio.url],
      });
    }

    if (message.content.video) {
      await webhook.send({
        content: message.content.video.caption,
        username: message.user.username,
        avatarURL: message.user.avatarUrl,
        files: [message.content.video.url],
      });
    }
  }
  catch (error) {
    console.error("Error trying to send a message: ", error);
  }
};

const deleteMessage = (ctx) => {
  const permissions = telegramClient.telegram.getChatMember(ctx.update.message.chat.id, ctx.botInfo.id);
  permissions.then((v) => {
    if (v.status === "administrator" && v.can_delete_messages) {
      ctx.deleteMessage();
    }
  });
  return;
};

const isMessageCryptoSpam = (message) => {

  let point = 0;
  const userId = message.user.userId.toLowerCase();

  for (const c of message.content.text) {
    if (cyrillicPattern.test(c)) {
      point++;
      break;
    }
  }

  userId.includes("bot") ? point = point + 2 : point = point + 0;
  message.content.text.includes("elonmusk") ? point++ : point = point + 0;
  message.content.text.includes("t.me/joinchat/") ? point = point + 2 : point = point + 0;
  cyrillicPattern.test(message.content.text) ? point++ : point = point + 0;
  if (point == 3) return true;
  for (const word of keywords) {
    if (message.content.text.includes(word)) {
      point++;
      if (point == 3) return true;
    }
  }

  return false;
};


const handleBridgeMessage = async (message, courseName, Course) => {
  if (!message.channel.parent || message.type === "CHANNEL_PINNED_MESSAGE") return;

  const group = await findCourseFromDb(courseName, Course);

  if (!group || group.telegramId == null) {
    return;
  }

  if (message.author.bot) return;
  const sender = message.member.displayName;
  let channel = ":";

  if (!message.channel.name.includes("general")) {
    channel = escapeChars(" on " + (message.channel.name.split(courseName.toLowerCase().replace(" ", "-"))[1]).substring(1) + " channel:\n");
  }

  let msg = message.content;
  if (msg[0] === "/") return;

  while (msg.match(/(?<=<#).*?(?=>)/)) {
    const channelID = msg.match(/(?<=<#).*?(?=>)/)[0];
    let channelName = message.guild.channels.cache.get(channelID);
    channelName ? channelName = channelName.name : channelName = "UnknownChannel";
    msg = msg.replace("<#" + channelID + ">", "#" + channelName);
  }

  while (msg.match(/(?<=<@!).*?(?=>)/)) {
    const userID = msg.match(/(?<=<@!).*?(?=>)/)[0];
    let userName = message.guild.members.cache.get(userID);
    userName ? userName = userName.user.username : userName = "Jon Doe";
    msg = msg.replace("<@!" + userID + ">", userName);
  }

  while (msg.match(/(?<=<@&).*?(?=>)/)) {
    const roleID = msg.match(/(?<=<@&).*?(?=>)/)[0];
    let roleName = message.guild.roles.cache.get(roleID);
    roleName ? roleName = roleName.name : roleName = "Unknown Role";
    msg = msg.replace("<@&" + roleID + ">", roleName);
  }

  while (msg.match(/(?<=<a:).*?(?=>)/)) {
    const emojiId = msg.match(/(?<=<a:).*?(?=>)/)[0];
    msg = msg.replace("<a:" + emojiId + ">", "");
  }

  while (msg.match(/(?<=<:).*?(?=>)/)) {
    const emojiId = msg.match(/(?<=<:).*?(?=>)/)[0];
    msg = msg.replace("<:" + emojiId + ">", "");
  }
  const media = message.attachments.first();
  const gif = message.embeds[0];
  try {
    if (media) {
      await sendMediaToTelegram(group.telegramId, msg, sender, channel, media);
    }
    else if (gif != undefined && gif.type != undefined && gif.type == "gifv") {
      await sendAnimationToTelegram(group.telegramId, sender, channel, gif.video.url);
    }
    else {
      await sendMessageToTelegram(group.telegramId, msg, sender, channel);
    }
  }
  catch (error) {
    return await sendErrorReportNoInteraction(group.telegramId, message.member, message.channel.name, discordClient, error.toString());
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
  if (content === "") {
    return;
  }
  sender ? sender = escapeChars(sender) : sender = null;
  content = validateContent(content);
  try {
    sender ?
      await telegramClient.telegram.sendMessage(telegramId, `*${sender}*${channel}\n${content}`, { parse_mode: "MarkdownV2" }) :
      await telegramClient.telegram.sendMessage(telegramId, `${content}`, { parse_mode: "MarkdownV2" });
  }
  catch (error) {
    return error;
  }
};

const sendMediaToTelegram = async (telegramId, info, sender, channel, media) => {
  sender = escapeChars(sender);
  info = validateContent(info);
  const url = media.url;
  const caption = `*${sender}*${channel} ${info}`;
  const filename = `${media.name}`;
  try {
    if (media.contentType.includes("video")) {
      await telegramClient.telegram.sendVideo(telegramId, { url, filename: filename }, { caption, parse_mode: "MarkdownV2" });
    }
    else if (media.contentType.includes("audio")) {
      await telegramClient.telegram.sendAudio(telegramId, { url, filename: filename }, { caption, parse_mode: "MarkdownV2" });
    }
    else if (media.contentType.includes("gif")) {
      await telegramClient.telegram.sendAnimation(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
    }
    else if (media.contentType.includes("image")) {
      await telegramClient.telegram.sendPhoto(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
    }
    else if (media.contentType.includes("application") || media.contentType.includes("text/plain")) {
      await telegramClient.telegram.sendDocument(telegramId, { url, filename: filename }, { caption, parse_mode: "MarkdownV2" });
    }
  }
  catch (error) {
    return error;
  }
};

const sendAnimationToTelegram = async (telegramId, sender, channel, url) => {
  sender = escapeChars(sender);
  const caption = `*${sender}*${channel}`;
  try {
    await telegramClient.telegram.sendAnimation(telegramId, { url }, { caption, parse_mode: "MarkdownV2" });
  }
  catch (error) {
    return error;
  }
};

const lockTelegramCourse = async (Course, courseName) => {
  const group = await findCourseFromDb(courseName, Course);
  if (!group || group.telegramId == null) {
    return;
  }
  const telegramId = group.telegramId;
  const permissions = {
    "can_send_messages" : false,
    "can_send_media_messages": false,
    "can_send_polls": false,
    "can_send_other_messages": false,
    "can_add_web_page_previews": false,
    "can_invite_users": false,
  };
  try {
    await telegramClient.telegram.setChatPermissions(telegramId, permissions);
    await sendMessageToTelegram(group.telegramId, "This chat has been locked", null, "");
  }
  catch (error) {
    console.log("Error " + error);
    return error;
  }
};

const unlockTelegramCourse = async (Course, courseName) => {
  const group = await findCourseFromDb(courseName, Course);
  if (!group || group.telegramId == null) {
    return;
  }
  const telegramId = group.telegramId;
  try {
    const permissions = {
      "can_send_messages" : true,
      "can_send_media_messages": true,
      "can_send_polls": true,
      "can_send_other_messages": true,
      "can_add_web_page_previews": true,
      "can_invite_users": true,
    };
    await telegramClient.telegram.setChatPermissions(telegramId, permissions);
    await sendMessageToTelegram(group.telegramId, "This chat has been unlocked", null, "");
  }
  catch (error) {
    return error;
  }
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
  lockTelegramCourse,
  unlockTelegramCourse,
};
