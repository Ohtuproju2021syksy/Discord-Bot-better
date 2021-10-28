const { findOrCreateRoleWithName, updateGuide } = require("./service");
const { facultyRole, githubRepo } = require("../../../config.json");

const findOrCreateChannel = async (channelObject, guild) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name.toLowerCase() === name.toLowerCase());
  if (alreadyExists) {
    if (options?.topic && alreadyExists.topic !== options.topic) {
      return await alreadyExists.setTopic(options.topic);
    }
    return alreadyExists;
  }
  return await guild.channels.create(name, options);
};

const initChannels = async (guild, client) => {

  const admin = guild.roles.cache.find(r => r.name === "admin");

  const channels = [
    {
      name: "commands",
      options: {
        type: "GUILD_TEXT",
        permissionOverwrites: [
          { id: guild.id, deny: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
          { id: client.user.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
          { id: admin.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
        ],
      },
    },
    {
      name: "guide",
      options: {
        type: "GUILD_TEXT",
        topic: `User manual for students: ${githubRepo}/blob/main/documentation/usermanual-student.md`,
        permissionOverwrites: [{ id: guild.id, deny: ["SEND_MESSAGES"], "allow": ["VIEW_CHANNEL"] }, { id: client.user.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] }],
      },
    },
  ];
  await channels.reduce(async (promise, channel) => {
    await promise;
    await findOrCreateChannel(channel, guild);
  }, Promise.resolve());
};

const initRoles = async (guild) => {
  await findOrCreateRoleWithName(facultyRole, guild);
  await findOrCreateRoleWithName("admin", guild);
};

const setInitialGuideMessage = async (guild, channelName, Course) => {
  const guideChannel = guild.channels.cache.find(c => c.type === "GUILD_TEXT" && c.name === channelName);
  if (!guideChannel.lastPinTimestamp) {
    const msg = await guideChannel.send("initial");
    await msg.pin();
  }
  const invs = await guild.invites.fetch();
  const guideinvite = invs.find(invite => invite.channel.name === "guide");
  if (!guideinvite) await guideChannel.createInvite({ maxAge: 0 });
  await updateGuide(guild, Course);
};

const initializeApplicationContext = async (client, Course) => {
  await initRoles(client.guild);
  await initChannels(client.guild, client);
  await setInitialGuideMessage(client.guild, "guide", Course);
};

module.exports = {
  initializeApplicationContext,
  initChannels,
  setInitialGuideMessage,
};