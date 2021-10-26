const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  getCourseNameFromCategory,
  createCourseInvitationLink,
  findCourseFromDb,
  findChannelsByCourse,
  isCourseCategory,
} = require("../../services/service");
const { editErrorEphemeral, sendEphemeral, editEphemeral } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { MessageEmbed, MessageAttachment } = require("discord.js");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Fetching status...");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!isCourseCategory(channel?.parent)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const courseRole = getCourseNameFromCategory(channel.parent, guild);
  const course = await findCourseFromDb(courseRole, models.Course);

  const instructorRole = `${courseRole} instructor`;
  const count = guild.roles.cache.find(
    (role) => role.name === courseRole,
  )?.members.size;

  const instructors = guild.roles.cache.find(
    (role) => role.name === instructorRole,
  )?.members.map(m => m.displayName);

  const instructorMessage = (instructors && instructors.length) ?
    `${instructors.join(", ")}` :
    "No instructors";

  const channels = await findChannelsByCourse(course.id, models.Channel);

  const blockedChannels = channels
    .filter(c => !c.bridged)
    .map(c => c.name);

  const blockedChannelMessage = (blockedChannels && blockedChannels.length) ?
    `${blockedChannels.join(", ")}` :
    "No blocked channels";

  await downloadImage();

  const img = new MessageAttachment(path.resolve(__dirname, "../../../promMetrics/stats/", "test.png"));
  const msbEmbed = new MessageEmbed()
    .setTitle("Stats for the course")
    .setImage("attachment://test.png");
  // channel.send({ embeds: [msbEmbed], files: [img] });

  return await editEphemeral(interaction, `
Course: ${course.name}
Fullname: ${course.fullName}
Code: ${course.code}
Hidden: ${course.private}
Invitation Link: ${createCourseInvitationLink(course.name)}
Bridge blocked on channels: ${blockedChannelMessage}
Instructors: ${instructorMessage}
Members: ${count}
  `, msbEmbed, img);
};

const downloadImage = async () => {
  const url = "http://95.216.219.139/grafana/render/d-solo/WpYTNiOnz/discord-dashboard?orgId=1&from=1634106757051&to=1634711557051&panelId=2&width=1000&height=500&tz=Europe%2FHelsinki";
  const filepath = path.resolve(__dirname, "../../../promMetrics/stats/", "test.png");
  const writer = fs.createWriteStream(filepath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: { "Authorization": `Bearer ${process.env.GRAFANA_TOKEN}` },
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Get full status of course.*")
    .setDefaultPermission(false),
  execute,
  usage: "/status",
  description: "Get full status of course.*",
  roles: ["admin", facultyRole],
};
