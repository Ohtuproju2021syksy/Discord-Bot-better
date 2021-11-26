const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

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
  confirmChoice,
  confirmChoiceNoInteraction,
};