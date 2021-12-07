const { MessageEmbed, MessageAttachment } = require("discord.js");
const path = require("path");
const { logError } = require("./logger");

const validateChannel = (channel) => {
  if (channel.parent) return false;
  else if (channel.name !== "commands") return false;
  else if (channel.type !== "GUILD_TEXT") return false;
  else return true;
};

const sendPullDateMessage = async (client) => {
  const commandsChannel = client.guild.channels.cache.find((c) => validateChannel(c));
  await commandsChannel.send(`Latest version pulled on ${new Date()}`);
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

const editEphemeralForStatus = async (interaction, msg) => {
  const img = new MessageAttachment(path.resolve(__dirname, "../../promMetrics/graph/", "graph.png"));
  const msgEmbed = new MessageEmbed()
    .setTitle("Trends")
    .setImage("attachment://graph.png");
  await interaction.editReply({ content: `${msg}`, ephemeral: true, embeds: [msgEmbed], files: [img] });
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

const sendReplyMessage = async (message, channel, replyText) => {
  const interactionId = message.id;
  const reply = await message.reply({ content: `${replyText}` });
  setTimeout(async () => {
    try {
      const fetchedReply = await channel.messages.fetch(reply.id);
      fetchedReply.delete();
    }
    catch (e) {
      logError(e);
      // console.log(error);
    }
    try {
      const fetchedInteraction = await channel.messages.fetch(interactionId);
      fetchedInteraction.delete();
    }
    catch (e) {
      logError(e);
      // console.log(error);
    }
  }, 86400000);
};

const sendFollowUpEphemeral = async (interaction, msg) => {
  await interaction.followUp({ content: `${msg}`, ephemeral: true });
};

module.exports = {
  sendPullDateMessage,
  sendErrorReport,
  sendErrorEphemeral,
  sendErrorReportNoInteraction,
  sendEphemeral,
  editEphemeral,
  editEphemeralWithComponents,
  editEphemeralClearComponents,
  editEphemeralForStatus,
  editErrorEphemeral,
  sendReplyMessage,
  sendFollowUpEphemeral,
};