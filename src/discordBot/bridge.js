const { Telegraf } = require("telegraf");
const { Groups } = require("../db/dbInit");
const { createNewGroup } = require("../discordBot/services/service");

module.exports = (client) => {
// Initialize bot clients

  const discordClient = client;

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
    // console.log(guild);
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
    // const courseName = name.split("_")[0];

    const courseName = message.channel.parent.name.replace("📚", "").trim();

    // console.log(`nospace${courseName}nospace`);

    const group = await Groups.findOne({ where: { course: String(courseName) } });

    if (!group) {
      console.log("at discordClient on group null");
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
    const group = await Groups.findOne({ where: { groupId: String(id) } });
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
      const user = ctx.message.from;
      const sender = user.first_name || user.username;
      const channel = await validDiscordChannel(courseName);
      return await sendMessageToDiscord(channel, `<${sender}>: ${ctx.message.text}`);
    }
  });
  return telegramBot;
};
