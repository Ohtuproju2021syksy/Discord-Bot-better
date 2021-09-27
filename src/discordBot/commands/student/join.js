const { SlashCommandBuilder } = require("@discordjs/builders");
const { updateGuide, findCategoryName, findCourseFromDb } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole } = require("../../../../config.json");

const execute = async (interaction, client, Course) => {
  let roleString = "";
  let message = "";

  if (interaction.options) {
    // Interaction was a slash command
    roleString = interaction.options.getString("course").toLowerCase().trim();
    message = `You have been added to a ${roleString} course.`;
  }
  else {
    // Command was copypasted or failed to register as an interaction
    roleString = interaction.roleString;
    const course = await findCourseFromDb(roleString, Course);
    if (!course) {
      return await sendErrorEphemeral(interaction, `Hey! I couldn't find a course with name ${roleString}, try typing /join and I'll offer you a helpful list of courses to select from.`);
    }
    const fullName = course.fullName;
    message = `Hey there! I tried my best to send you to the right place! ${fullName}, right? \n You can also try writing /join and I'll offer you a helpful list of courses to click from!`;
  }

  const guild = client.guild;
  const member = guild.members.cache.get(interaction.member.user.id);
  const courseRole = guild.roles.cache.find(r => r.name === roleString);

  const courseRoles = guild.roles.cache
    .filter(r => (r.name === `${roleString} ${courseAdminRole}` || r.name === `${roleString}`))
    .map(r => r.name);

  if (!courseRoles.length) {
    return await sendErrorEphemeral(interaction, `Invalid course name: ${roleString}`);
  }
  if (member.roles.cache.some(r => courseRoles.includes(r.name))) {
    return await sendErrorEphemeral(interaction, `You are already on a ${roleString} course.`);
  }

  await member.roles.add(courseRole);
  await sendEphemeral(interaction, message);
  await updateGuide(guild, Course);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a course.")
    .setDefaultPermission(true)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Course to join.")
        .setRequired(true)),
  execute,
  usage: "/join [course name]",
  description: "Join a course.",
};