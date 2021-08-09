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
  if (!webhooks.size) await channel.createWebhook(courseName, { avatar: "https://i.imgur.com/AfFp7pu.png" }).catch(console.error);
  // --
  return channel;
};

// Create user
const createDiscordUser = async (ctx) => {
  const username = ctx.message.from.first_name || ctx.message.from.username;
  let url;
  const t = await telegramClient.telegram.getUserProfilePhotos(ctx.message.from.id);
  if (!t.photos.length) url = "https://i.imgur.com/AfFp7pu.png";
  else url = await telegramClient.telegram.getFileLink(t.photos[0][0].file_id);
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

const sendMessageToTelegram = async (groupId, content) => {
  await telegramClient.telegram.sendMessage(groupId, content);
};

const sendPhotoToTelegram = async (groupId, url, caption) => {
  await telegramClient.telegram.sendPhoto(groupId, { url }, { caption });
};

const createNewGroup = async (args, Groups) => {
  const courseName = args[0];
  // const groupId = parseInt(args[1]);
  const groupId = args[1];

  await Groups.create({ groupId: groupId, course: courseName });
};

const startBridge = (client, tClient) => {
  discordClient = client;
  telegramClient = tClient;
  console.log("Bridge started");
};

module.exports = {
  validDiscordChannel,
  createDiscordUser,
  sendMessageToDiscord,
  sendMessageToTelegram,
  sendPhotoToTelegram,
  createNewGroup,
  startBridge,
};