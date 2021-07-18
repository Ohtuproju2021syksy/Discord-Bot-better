const Discord = require("discord.js");
const { Telegraf } = require("telegraf");
const { Groups } = require("../db/dbInit");
const { createNewGroup } = require("../discordBot/services/service");


// Initialize bot clients

const discordClient = new Discord.Client();

discordClient.once("ready", async () => {
  console.log("Discord bridge ready!");
});
discordClient.login(process.env.DISCORD_BOT_TOKEN);


const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
telegramBot.command("quit", (ctx) => {
  console.log("quit");
  ctx.telegram.leaveChat(ctx.message.chat.id);
});
telegramBot.launch();

// Enable graceful stop
process.once("SIGINT", () => telegramBot.stop("SIGINT"));
process.once("SIGTERM", () => telegramBot.stop("SIGTERM"));

// validate discord channel

const validDiscordChannel = async (courseName) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  const channel = guild.channels.cache.find(
    c => c.name === `${courseName}_general`,
  );
  return channel;
};

// Send message methods

const sendMessageToDiscord = async (channel, content) => {
  channel.send(content);
};

const sendMessageToTelegram = async (groupId, content) => {
  telegramBot.telegram.sendMessage(groupId, content);
};


// Event handlers

discordClient.on("message", async message => {
  // console.log(message)
  const name = message.channel.name;
  const courseName = name.split("_")[0];

  const group = await Groups.findOne({ where: { course: courseName } });
  // console.log(group);

  if (!group) return;
  if (message.author.bot) return;

  const sender = message.member.nickname || message.author.username;
  let channel = "";
  channel = name === `${courseName}_announcement` ? " announcement" : channel;
  channel = name === `${courseName}_general` ? " general" : channel;

  sendMessageToTelegram(group.group, `<${sender}>${channel}: ${message.content}`);
});

telegramBot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/id")) {
    const discordCourseName = ctx.message.text.slice(3).toLowerCase().trim();
    const id = (await ctx.getChat()).id;
    const telegramCourseName = await ctx.getChat().title;
    const channel = await validDiscordChannel(discordCourseName);
    if (!channel) {
      await sendMessageToTelegram(id,
        `Bridge not created: Invalid discord channel ${discordCourseName}`);
      return;
    }
    await createNewGroup([discordCourseName, id], Groups).catch((error) => console.log(error));
    await sendMessageToDiscord(channel,
      `Brigde created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}`);
    await sendMessageToTelegram(id,
      `Brigde created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}`);
    return;
  }

  const group = await Groups.findOne({ where: { group: String(ctx.message.chat.id) } });
  if (!group) {
    return;
  }

  const courseName = group.course;

  if (String(ctx.message.chat.id) === group.group) {
    const user = ctx.message.from;
    const sender = user.first_name || user.username;
    sendMessageToDiscord(courseName, `<${sender}>: ${ctx.message.text}`);
    return;
  }
});
