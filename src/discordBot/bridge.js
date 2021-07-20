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

// validate discord channel

const validDiscordChannel = async (courseName) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  console.log(guild);
  console.log(`${courseName}_general`);
  const channel = guild.channels.cache.find(
    c => c.name === `${courseName}_general`,
  );
  return channel;
};

// Send message methods

const sendMessageToDiscord = async (channel, content) => {
  await channel.send(content);
};

const sendMessageToTelegram = async (groupId, content) => {
  await telegramBot.telegram.sendMessage(groupId, content);
};


// Event handlers

discordClient.on("message", async message => {
  // console.log(message.channel.name);
  const name = message.channel.name;
  if (!message.channel.parent) return;
  // const courseName = name.split("_")[0];

  const courseName = getRoleFromCategory(message.channel.parent.name);

  // console.log(`nospace${courseName}nospace`);

  const group = await Groups.findOne({ raw: true, where: { course: String(courseName) } });

  if (!group) {
    return;
  }
  // console.log(message.author.bot);
  if (message.author.bot) return;
  // console.log("ei botti");
  const sender = message.member.nickname || message.author.username;
  let channel = "";
  channel = name === `${courseName}_announcement` ? " announcement" : channel;
  channel = name === `${courseName}_general` ? " general" : channel;

  await sendMessageToTelegram(group.groupId, `<${sender}>${channel}: ${message.content}`);
});

telegramBot.on("text", async (ctx) => {
  const id = (await ctx.getChat()).id;
  const group = await Groups.findOne({ raw: true, where: { groupId: String(id) } });
  if (ctx.message.text.startsWith("/id")) {
    const discordCourseName = ctx.message.text.slice(3).toLowerCase().trim();
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
    await createNewGroup([discordCourseName, id], Groups).catch((error) => console.log(error));
    await sendMessageToDiscord(channel,
      `Brigde created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}`);
    await sendMessageToTelegram(id,
      `Brigde created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}`);
  }

  if (!group) {
    return;
  }

  const courseName = group.course;

  if (String(ctx.message.chat.id) === group.groupId) {
    console.log("telegram message to discord");
    console.log(courseName);
    const user = ctx.message.from;
    const sender = user.first_name || user.username;
    const channel = await validDiscordChannel(courseName);
    return await sendMessageToDiscord(channel, `<${sender}>: ${ctx.message.text}`);
  }
});

module.exports = () => {
  discordClient.login(process.env.DISCORD_BOT_TOKEN);
  telegramBot.launch();
};
