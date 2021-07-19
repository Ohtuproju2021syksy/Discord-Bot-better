const { findOrCreateRoleWithName, updateGuide } = require("./service");

const findOrCreateChannel = (guild, channelObject) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name,
  );
  if (alreadyExists) return alreadyExists;
  return guild.channels.create(name, options);
};

const initChannels = async (guild, client) => {

  const admin = guild.roles.cache.find(r => r.name === "admin");

  const channels = [
    {
      name: "commands",
      options: {
        type: "text",
        permissionOverwrites: [{ id: guild.id, deny: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
          { id: client.user.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] },
          { id: admin.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] }] },
    },
    {
      name: "guide",
      options: {
        type: "text",
        topic: " ",
        permissionOverwrites: [{ id: guild.id, deny: ["SEND_MESSAGES"], "allow": ["VIEW_CHANNEL"] }, { id: client.user.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] }],
      },
    },
  ];
  await channels.reduce(async (promise, channel) => {
    await promise;
    await findOrCreateChannel(guild, channel);
  }, Promise.resolve());
};

const initRoles = async (guild) => {
  await findOrCreateRoleWithName("teacher", guild);
  await findOrCreateRoleWithName("admin", guild);
};

const setInitialGuideMessage = async (guild, channelName) => {
  const guideChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
  if (!guideChannel.lastPinTimestamp) {
    const msg = await guideChannel.send("initial");
    await msg.pin();
  }
  const invs = await guild.fetchInvites();
  const guideinvite = invs.find(invite => invite.channel.name === "guide");
  if (!guideinvite) await guideChannel.createInvite({ maxAge: 0 });
  await updateGuide(guild);
};

const initializeApplicationContext = async (client) => {
  await initRoles(client.guild);
  await initChannels(client.guild, client);
  await setInitialGuideMessage(client.guild, "guide");
};

module.exports = {
  initializeApplicationContext,
  initChannels,
  setInitialGuideMessage,
};