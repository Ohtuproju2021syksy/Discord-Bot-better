const { Telegraf } = require("telegraf");
const { Groups } = require("../db/dbInit");
const { createNewGroup, getRoleFromCategory } = require("../discordBot/services/service");
const Discord = require("discord.js");


// Initialize bot clients
const discordClient = new Discord.Client();

discordClient.once("ready", async () => {
  console.log("Discord bridge ready!");
});

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
telegramBot.command("quit", (ctx) => {
  console.log("quit");
  ctx.telegram.leaveChat(ctx.message.chat.id);
});

// Enable graceful stop
process.once("SIGINT", () => telegramBot.stop("SIGINT"));
process.once("SIGTERM", () => telegramBot.stop("SIGTERM"));

// validate discord channel and create webhook if no webhook
const validDiscordChannel = async (courseName) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  courseName = courseName.replace(/ /g, "-");
  const channel = guild.channels.cache.find(
    c => c.name === `${courseName}_general`,
  );
  // temp - create webhook for existing bridged channels
  if (!channel) return;
  const webhooks = await channel.fetchWebhooks();
  if (!webhooks.size) await channel.createWebhook(courseName, { avatar: "https://i.imgur.com/AfFp7pu.png" }).catch(console.error);
  // --
  return channel;
};

// Create user
const createDiscordUser = async (ctx) => {
  const username = ctx.message.from.first_name || ctx.message.from.username;
  let url;
  const t = await telegramBot.telegram.getUserProfilePhotos(ctx.message.from.id);
  if (!t.photos.length) url = "https://i.imgur.com/AfFp7pu.png";
  else url = await telegramBot.telegram.getFileLink(t.photos[0][0].file_id);
  const user = { username: username, avatarUrl: url };
  return user;
};


const escapeChars = (content) => {
  return content
    .replaceAll("_", "\\_")
    .replaceAll("*", "\\*")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("~", "\\~")
    // .replaceAll("`", "\\`")
    .replaceAll(">", "\\>")
    .replaceAll("#", "\\#")
    .replaceAll("+", "\\+")
    .replaceAll("-", "\\-")
    .replaceAll("=", "\\=")
    .replaceAll("|", "\\|")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll(".", "\\.")
    .replaceAll("!", "\\!");
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

const sendMessageToTelegram = async (groupId, content) => {
  content = escapeChars(content);
  await telegramBot.telegram.sendMessage(groupId, content, { parse_mode: "MarkdownV2" });
};

const sendPhotoToTelegram = async (groupId, url, caption) => {
  await telegramBot.telegram.sendPhoto(groupId, { url }, { caption });
};


// Event handlers
discordClient.on("message", async message => {
  if (!message.channel.parent) return;
  const channelName = message.channel.name;

  const courseName = getRoleFromCategory(message.channel.parent.name);

  const group = await Groups.findOne({ where: { course: String(courseName) } });

  if (!group) {
    return;
  }
  if (message.author.bot) return;

  const sender = message.member.nickname || message.author.username;

  let channel = "";
  const name = courseName.replace(/ /g, "-");
  channel = channelName === `${name}_announcement` ? " announcement" : channel;
  channel = channelName === `${name}_general` ? " general" : channel;

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

  // Handle images correctly
  const photo = message.attachments.first();
  if (photo) {
    sendPhotoToTelegram(group.groupId,
      photo.url,
      `<${sender}>${channel}: ${msg}`,
    );
  }
  else {
    await sendMessageToTelegram(group.groupId, `<${sender}>${channel}: ${msg}`);
  }
});


// Send photo to discord
telegramBot.on("photo", async (ctx) => {
  const id = ctx.message.chat.id;
  const group = await Groups.findOne({ where: { groupId: String(id) } });
  if (!group) {
    return;
  }
  const url = await telegramBot.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1]);

  const courseName = group.course;
  if (String(ctx.message.chat.id) === group.groupId) {
    const discordUser = await createDiscordUser(ctx);
    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    const message = { user: discordUser, content: { photo: { url: url.href, caption: ctx.message.caption } } };
    return await sendMessageToDiscord(message, channel);
  }
});

telegramBot.on("text", async (ctx) => {
  const id = ctx.message.chat.id;
  const group = await Groups.findOne({ where: { groupId: String(id) } });


  if (ctx.message.text.startsWith("/bridge")) {
    const discordCourseName = ctx.message.text.slice(7).toLowerCase().trim();
    const telegramCourseName = (await ctx.getChat()).title;
    const channel = await validDiscordChannel(discordCourseName);
    if (!channel) {
      return await sendMessageToTelegram(id,
        `Bridge not created: Invalid discord channel ${discordCourseName}`);
    }
    if (group) {
      return await sendMessageToTelegram(id,
        `Bridge not created: the bridge already exists ${telegramCourseName} <--> ${group.course}`);
    }
    await channel.createWebhook(discordCourseName, { avatar: "https://i.imgur.com/AfFp7pu.png" }).catch(console.error);
    await createNewGroup([discordCourseName, id], Groups).catch((error) => console.log(error));
    const discordUser = await createDiscordUser(ctx);
    const message = { user: discordUser, content: { text: `Bridge created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}` } };
    await sendMessageToDiscord(message, channel);
    await sendMessageToTelegram(id, `Bridge created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}`);
  }

  if (!group) return;

  const courseName = group.course;

  if (String(ctx.message.chat.id) === group.groupId) {
    const discordUser = await createDiscordUser(ctx);
    const message = { user: discordUser, content: { text: `${ctx.message.text}` } };
    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    return await sendMessageToDiscord(message, channel);
  }
});

module.exports = () => {
  discordClient.login(process.env.DISCORD_BOT_TOKEN);
  telegramBot.launch();
};
