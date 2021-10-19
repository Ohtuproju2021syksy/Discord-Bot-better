const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const { sendEphemeral, editEphemeral } = require("../../services/message");

const { facultyRole } = require("../../../../config.json");
const numbers = [ "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟" ];

const execute = async (interaction, client) => {

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  const pollTitle = interaction.options.getString("title").trim();
  await sendEphemeral(interaction, "Creating poll...");


  let answers = 0;
  const voteMap = new Map();
  const answerList = interaction.options.getString("answers").split(" | ");
  if (answerList.length > 10) {
    await editEphemeral(interaction, "Too many answer options, acceptable amount is between 1 - 10");
    return;
  }

  let answerDescription = "";

  if (interaction.options.getString("description")) {
    answerDescription = interaction.options.getString("description") + "\n\n\n";
  }

  for (let i = 0; i < answerList.length; i++) {
    answerDescription = answerDescription.concat(numbers[i] + " -> " + answerList[i] + "\n\n");
    answers++;
    voteMap.set(numbers[i], 0);
  }

  answerDescription = answerDescription.concat("\n\nYou can vote only one option.\nYou can remove your vote with ❌ so you can change your vote");

  const pollEmbed = new MessageEmbed()
    .setColor().setColor("#0099ff")
    .setTitle(pollTitle)
    .setDescription(answerDescription);

  const row = new MessageActionRow();
  const row2 = new MessageActionRow();
  const row3 = new MessageActionRow();

  for (let i = 0; i < 5 && i < answerList.length; i++) {
    row.addComponents(
      new MessageButton()
        .setCustomId("" + i)
        .setLabel(numbers[i])
        .setStyle("PRIMARY"),
    );
  }

  if (answerList.length > 5) {
    for (let i = 5; i < answerList.length; i++) {
      row2.addComponents(
        new MessageButton()
          .setCustomId("" + i)
          .setLabel(numbers[i])
          .setStyle("PRIMARY"),
      );
    }
  }
  if (answerList.length < 5) {
    row.addComponents(
      new MessageButton()
        .setCustomId("x")
        .setLabel("❌")
        .setStyle("SECONDARY"),
    );
  }
  else if (answerList.length < 10) {
    row2.addComponents(
      new MessageButton()
        .setCustomId("x")
        .setLabel("❌")
        .setStyle("SECONDARY"),
    );
  }
  else {
    row3.addComponents(
      new MessageButton()
        .setCustomId("x")
        .setLabel("❌")
        .setStyle("SECONDARY"),
    );
  }
  let msgEmbed = "";

  if (answerList.length === 10) {
    msgEmbed = await channel.send({ embeds: [pollEmbed], components: [row, row2, row3] });
  }
  else if (answerList.length >= 5) {
    msgEmbed = await channel.send({ embeds: [pollEmbed], components: [row, row2] });
  }
  else {
    msgEmbed = await channel.send({ embeds: [pollEmbed], components: [row] });
  }

  await editEphemeral(interaction, "Poll started, it will close in " + interaction.options.getInteger("duration") + " minutes or you can close the poll by pressing button ❌");


  let duration;

  if (interaction.options.getInteger("duration") < 600000) {
    duration = interaction.options.getInteger("duration") * 60000;
  }
  else {
    duration = 600000;
  }
  const collectorbutton = msgEmbed.createMessageComponentCollector({ componentType: "BUTTON", time: duration });
  const userMap = new Map();
  let stop = false;

  collectorbutton.on("collect", i => {
    const userTag = i.user.tag;
    const buttonId = i.customId;
    if (!userMap.has(userTag) && !i.user.bot && buttonId !== "x") {
      userMap.set(userTag, numbers[buttonId]);
      voteMap.set(numbers[buttonId], voteMap.get(numbers[buttonId]) + 1);
      i.reply({ content: "Thank you for voting!", ephemeral: true });
    }
    else if (buttonId == "x") {
      if (guild.members.cache.get(i.user.id).roles.cache.some(r => r.name === "faculty" || r.name === "admin")) {
        stop = true;
      }
      else {
        const emojiToRemove = userMap.get(userTag);
        voteMap.set(emojiToRemove, voteMap.get(emojiToRemove) - 1);
        userMap.delete(userTag);
        i.reply({ content: "Vote removed, you can now vote again!", ephemeral: true });
      }
    }
    else {
      i.reply({ content: "You have voted already, you can remove your vote by pressing ❌", ephemeral: true });
    }
  });


  for (let i = 0; i < duration;) {
    await sleep(1000);
    i = i + 1000;
    if (stop) {
      break;
    }
  }

  let resultsText = "";

  if (interaction.options.getString("description")) {
    resultsText = interaction.options.getString("description") + "\n\n\n";
  }

  let highestScore = 0;
  let highestOption = "";
  for (let i = 0, len = answers; i < len; i++) {
    resultsText = resultsText.concat(numbers[i] + " " + answerList[i] + " = " + (voteMap.get(numbers[i])) + "\n\n");
    if (voteMap.get(numbers[i]) > highestScore) {
      highestScore = voteMap.get(numbers[i]);
    }
  }

  for (const [key, value] of voteMap.entries()) {
    if (value === highestScore) {
      if (highestOption === "") {
        highestOption = answerList[numbers.indexOf(key)];
      }
      else {
        highestOption = highestOption.concat(", " + answerList[numbers.indexOf(key)]);
      }
    }
  }

  resultsText = resultsText.concat("Most votes: " + highestOption);


  const resultEmbed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Results of the poll")
    .setDescription(resultsText);

  await channel.send({ embeds: [resultEmbed] });

  msgEmbed.delete();

  await editEphemeral(interaction, "Poll closed, results are in");

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName("create_poll")
    .setDescription("Create poll")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Poll title")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("duration")
        .setDescription("Duration of the poll (1-10 minutes)")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("answers")
        .setDescription("Answers for poll separated by | (e.g. answer1 | answer2 | answer3)")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("description")
        .setDescription("Set description for the poll")
        .setRequired(false)),
  execute,
  usage: "/create_poll ",
  description: "Create a poll for x duration*",
  roles: ["admin", facultyRole],
};