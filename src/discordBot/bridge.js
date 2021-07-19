const Discord = require("discord.js");
const { Telegraf } = require("telegraf");
const { Groups } = require("../db/dbInit");


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


// Send message methods

const sendMessageToDiscord = async (courseName, content) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  console.log(guild);
  const channel = guild.channels.cache.find(
    c => c.name === `${courseName}_general`,
  );
  console.log(channel);

  if (!channel) {
    console.log("not channel");
    return;
  }
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
  // console.log(ctx.message.chat);

  if (ctx.message.text === "/id") {
    console.log(`id: ${(await ctx.getChat()).id}`);
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
