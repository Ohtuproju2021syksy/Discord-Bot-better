const { commandsCategory } = require("../config.json");
const { Invites } = require("./dbInit");

const { findOrCreateRoleWithName, updateGuide, findOrCreateInviteToDatabase } = require("./service");

const findOrCreateChannel = (guild, channelObject) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name,
  );
  if (alreadyExists) return alreadyExists;
  return guild.channels.create(name, options);
};

const initChannels = async (guild, categoryName, client) => {
  const category = await guild.channels.cache.find(c => c.type === "category" && c.name === categoryName) ||
    await guild.channels.create(
      categoryName,
      {
        type: "category",
      });

  const channels = [
    {
      name: "commands",
      options: {
        parent: category,
        type: "text",
      },
    },
    {
      name: "guide",
      options: {
        parent: category,
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

    const invs = await guild.fetchInvites();
    const guideinvite = invs.find(invite => invite.channel.name === "guide");
    if (!guideinvite) {
      const invite = await guideChannel.createInvite({ maxAge: 0 });
      await findOrCreateInviteToDatabase(guild, invite, "guide");

    }
    guild.inv = await guild.fetchInvites();
    await updateGuide(guild);
  }
};

const initializeApplicationContext = async (client) => {
  await initChannels(client.guild, commandsCategory, client);
  await setInitialGuideMessage(client.guild, "guide");
  await initRoles(client.guild);
  const storedInvites = await Invites.findAll();
  storedInvites.forEach(i => client.guild.invites.set(i.code, i));
};

module.exports = {
  initializeApplicationContext,
};