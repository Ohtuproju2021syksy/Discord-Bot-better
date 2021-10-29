const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const validateChannel = (channel) => {
  if (channel.parent) return false;
  else if (channel.name !== "commands") return false;
  else if (channel.type !== "GUILD_TEXT") return false;
  else return true;
};

const sendErrorReport = async (interaction, client, error) => {
  const commandsChannel = client.guild.channels.cache.find((c) => validateChannel(c));
  const member = client.guild.members.cache.get(interaction.member.user.id);
  const channel = client.guild.channels.cache.get(interaction.channelId);
  const msg = `**ERROR DETECTED!**\nMember: ${member.displayName}\nCommand: ${interaction.commandName}\nChannel: ${channel.name}`;
  await commandsChannel.send({ content: msg });
  await commandsChannel.send({ content: error });
};

const sendErrorReportNoInteraction = async (telegramId, member, channel, client, error) => {
  const commandsChannel = client.guild.channels.cache.find((c) => validateChannel(c));
  const msg = `**ERROR DETECTED!**\nMember: ${member}\nChannel: ${channel}`;
  await commandsChannel.send({ content: msg });
  await commandsChannel.send({ content: error });
};

const sendErrorEphemeral = async (interaction, msg) => {
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: `Error: ${msg}`, ephemeral: true });
  }
  else {
    await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
  }
};

const sendEphemeral = async (interaction, msg) => {
  await interaction.reply({ content: `${msg}`, ephemeral: true });
};

const editEphemeral = async (interaction, msg) => {
  await interaction.editReply({ content: `${msg}`, ephemeral: true });
};

const editEphemeralWithComponents = async (interaction, msg, components) => {
  return await interaction.editReply({ content: `${msg}`, components: [components], ephemeral: true });
};

const editEphemeralClearComponents = async (interaction, msg) => {
  await interaction.editReply({ content: `${msg}`, components: [], ephemeral: true });
};
const editErrorEphemeral = async (interaction, msg) => {
  await interaction.editReply({ content: `Error: ${msg}`, ephemeral: true });
};

const sendReplyMessage = async (interaction, channel, msg) => {
  const interactionId = interaction.id;
  const reply = await interaction.reply({ content: `${msg}` });
  setTimeout(async () => {
    try {
      const fetchedReply = await channel.messages.fetch(reply.id);
      fetchedReply.delete();
    }
    catch (e) {
      // console.log(error);
    }
    try {
      const fetchedInteraction = await channel.messages.fetch(interactionId);
      fetchedInteraction.delete();
    }
    catch (e) {
      // console.log(error);
    }
  }, 86400000);
};

const sendFollowUpEphemeral = async (interaction, msg) => {
  await interaction.followUp({ content: `${msg}`, ephemeral: true });
};

const confirmChoice = async (interaction, msg) => {

  const answerRow = new MessageActionRow();
  answerRow.addComponents(
    new MessageButton()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("decline")
      .setLabel("Decline")
      .setStyle("DANGER"),
  );

  const reply = await interaction.editReply({ content: `${msg}`, components: [answerRow], ephemeral: true });
  const collector = reply.createMessageComponentCollector({ componentType: "BUTTON", time: 60000 });
  let stop = false;
  let confirm = false;
  collector.on("collect", i => {
    if (i.customId === "confirm") {
      interaction.editReply({ content: "Confirming...", components: [] });
      confirm = true;
      stop = true;
    }
    else if (i.customId === "decline") {
      interaction.editReply({ content: "Declining...", components: [] });
      stop = true;
    }
  });
  for (let i = 0; i < 60000;) {
    await sleep(1000);
    i = i + 1000;
    if (stop) return confirm;
  }
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  interaction.editReply({ content: "Timeout...", components: [] });
  return confirm;
};

const confirmChoiceNoInteraction = async (message, interactionMessage, guild) => {
  const confirmEmbed = new MessageEmbed()
    .setColor().setColor("#0099ff")
    .setTitle(interactionMessage);

  const row = new MessageActionRow();
  row.addComponents(
    new MessageButton()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("decline")
      .setLabel("Decline")
      .setStyle("DANGER"),
  );

  const channel = guild.channels.cache.get(message.channelId);
  const messageAuthorId = message.author.id;
  const msgEmbed = await channel.send({ embeds: [confirmEmbed], components: [row] });
  const collector = msgEmbed.createMessageComponentCollector({ componentType: "BUTTON", time: 60000 });
  let stop = false;
  let confirm = false;
  collector.on("collect", i => {
    const userId = i.user.id;
    const buttonId = i.customId;
    if (userId === messageAuthorId && buttonId === "confirm") {
      confirm = true;
      stop = true;
    }
    else if (userId === messageAuthorId && buttonId === "decline") {
      stop = true;
    }
    else {
      i.reply({ content: "Wrong user!" });
    }
  });

  for (let i = 0; i < 60000;) {
    await sleep(1000);
    i = i + 1000;
    if (stop) {
      break;
    }
  }
  msgEmbed.delete();
  return confirm;

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

};

module.exports = {
  sendErrorReport,
  sendErrorEphemeral,
  sendErrorReportNoInteraction,
  sendEphemeral,
  editEphemeral,
  editEphemeralWithComponents,
  editEphemeralClearComponents,
  editErrorEphemeral,
  sendReplyMessage,
  sendFollowUpEphemeral,
  confirmChoice,
  confirmChoiceNoInteraction,
};