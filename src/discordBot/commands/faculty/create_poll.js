const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const { sendEphemeral, editEphemeral } = require("../../services/message");

const { facultyRole } = require("../../../../config.json");


const execute = async (interaction, client) => {

  const guild = client.guild;
  const numbers = [ "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
  const channel = guild.channels.get(interaction.channel_id);

  const pollTitle = interaction.options.getString("title").trim();
  await sendEphemeral(interaction, "Creating poll...");


  let answerList = "";
  let answers = 0;
  if (interaction.options.getString("answer1")) {
    answerList = answerList.concat("1️⃣ -> " + interaction.options.getString("answer1") + "\n\n");
    answers++;
  }
  if (interaction.options.getString("answer2")) {
    answerList = answerList.concat("2️⃣ -> " + interaction.options.getString("answer2") + "\n\n");
    answers++;
  }
  if (interaction.options.getString("answer3")) {
    answerList = answerList.concat("3️⃣ -> " + interaction.options.getString("answer3") + "\n\n");
    answers++;
  }
  if (interaction.options.getString("answer4")) {
    answerList = answerList.concat("4️⃣ -> " + interaction.options.getString("answer4") + "\n\n");
    answers++;
  }
  if (interaction.options.getString("answer5")) {
    answerList = answerList.concat("5️⃣ -> " + interaction.options.getString("answer5") + "\n\n");
    answers++;
  }

  const pollEmbed = new MessageEmbed()
    .setColor().setColor("#0099ff")
    .setTitle(pollTitle)
    .setDescription(answerList);

  const msgEmbed = await channel.send(pollEmbed);

  await editEphemeral(interaction, "Poll started");

  for (let i = 0, len = answers; i < len; i++) {
    msgEmbed.react(numbers[i]);
  }

  if (interaction.options.getString("duration")) {
    const time = interaction.options.getInt("duration") * 60000;
    await sleep(time);
  }
  else {
    await sleep(90000);
  }

  const reactions = msgEmbed.reactions.cache;
  let resultsText = "";
  for (let i = 0, len = answers.length; i < len; i++) {
    resultsText = resultsText.concat("Number of " + numbers[i] + " = " + reactions.get(numbers[i]).count) + "\n\n";
  }

  const resultEmbed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Results of the poll")
    .setDescription(resultsText);

  await channel.send(resultEmbed);

  await editEphemeral(interaction, "Poll duration ended");


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
    .addIntegerOption(option =>
      option.setName("duration")
        .setDescription("Duration of the poll")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Poll title")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("answer1")
        .setDescription("Answer 1")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("answer2")
        .setDescription("Answer 2")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("answer3")
        .setDescription("Answer 3")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("answer4")
        .setDescription("Answer 4")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("answer5")
        .setDescription("Answer 5")
        .setRequired(false)),
  execute,
  usage: "/create_poll ",
  description: "Create a poll for x duration*",
  roles: ["admin", facultyRole],
};