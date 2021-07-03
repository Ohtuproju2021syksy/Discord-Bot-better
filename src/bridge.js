const Discord = require("discord.js");
const { Telegraf } = require("telegraf");


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

const sendMessageToDiscord = async (content) => {
  const guild = await discordClient.guilds.fetch(process.env.GUILD_ID);
  const channel = guild.channels.cache.find(
    c => c.name === `${process.env.COUSRE_NAME}_general`,
  );
  channel.send(content);
};

const sendMessageToTelegram = async (content) => {
  telegramBot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, content);
};


// Event handlers

discordClient.on("message", async message => {
  const name = message.channel.name;
  if (!name.startsWith(process.env.COURSE_NAME)) return;
  if (message.author.bot) return;
  const sender = message.member.nickname || message.author.username;
  let channel = "";
  channel = name === `${process.env.COURSE_NAME}_announcement` ? " tiedotus" : channel;
  channel = name === `${process.env.COURSE_NAME}_questions` ? " kysymys" : channel;
  sendMessageToTelegram(`<${sender}>${channel}: ${message.content}`);
});

telegramBot.on("text", async (ctx) => {
  if (ctx.message.text === "/id") {
    console.log(`id: ${(await ctx.getChat()).id}`);
    return;
  }

  const user = ctx.message.from;
  const sender = user.first_name || user.username;
  sendMessageToDiscord(`<${sender}>: ${ctx.message.text}`);
});
