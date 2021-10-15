const { SlashCommandBuilder } = require("@discordjs/builders");
const { getCourseNameFromCategory } = require("../../services/service");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  await sendEphemeral(interaction, "Fetching instructors...");
  const guild = client.guild;

  let roleString;
  if (interaction.options.getString("course")) {
    roleString = interaction.options.getString("course").toLowerCase().trim();
  }
  else {
    const category = guild.channels.cache.get(interaction.channelId).parent;
    if (!category) {
      return await editErrorEphemeral(interaction, "Provide course name as argument or use the command in course channel.");
    }
    else {
      roleString = getCourseNameFromCategory(category.name);
    }
  }

  const instructorRole = guild.roles.cache.find(r => r.name === `${roleString} ${courseAdminRole}`);

  if (!instructorRole) return await editErrorEphemeral(interaction, `No instructors for ${roleString}`);

  let adminsString = "";
  instructorRole.members.forEach(m => {
    const member = guild.members.cache.get(m.user.id);
    if (member.roles.cache.some(r => r.name === "faculty")) {
      if (adminsString === "") {
        adminsString = "<@" + member.user.id + ">";
      }
      else {
        adminsString = ", " + "<@" + member.user.id + ">";
      }

    }
  });

  instructorRole.members.forEach(m => {
    const member = guild.members.cache.get(m.user.id);
    if (!member.roles.cache.some(r => r.name === "faculty")) {
      if (adminsString === "") {
        adminsString = "<@" + member.user.id + ">";
      }
      else {
        adminsString = adminsString + ", " + "<@" + member.user.id + ">";
      }

    }
  });


  if (!adminsString) return await editErrorEphemeral(interaction, `No instructors for ${roleString}`);

  await editEphemeral(interaction, `Here are the instructors for ${roleString}: ${adminsString}`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("instructors")
    .setDescription("Prints out the instructors of the course.*")
    .setDefaultPermission(true)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Course to print instructors of")
        .setRequired(false)),
  execute,
  usage: "/instructors <course name>",
  description: "Prints out the instructors of the course.",
};
