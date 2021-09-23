const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  setCoursePositionABC,
  findCategoryName,
  createCourseInvitationLink,
  findChannelWithNameAndType,
  updateGuide,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  trimCourseName,
  findCourseFromDb,
  createCourseToDatabase } = require("../../services/service");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { courseAdminRole, facultyRole } = require("../../../../config.json");


const changeCourseNames = async (newValue, channel, category, guild) => {
  if (guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && (c.name === `📚 ${newValue}` || c.name === `🔒 ${newValue}`))) return;
  if (category.name.includes("📚")) {
    await category.setName(`📚 ${newValue}`);
  }
  else {
    await category.setName(`🔒 ${newValue}`);
  }
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === channel.parent)
    .map(async ch => {
      const newName = ch.name.replace(/.*_/, `${newValue}_`);
      await ch.setName(newName);
    },
    ));
  return true;
};

const changeCourseRoles = async (categoryName, newValue, guild) => {
  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${categoryName} ${courseAdminRole}` || r.name === categoryName))
    .map(async role => {
      if (role.name.includes("instructor")) {
        role.setName(`${newValue} instructor`);
      }
      else {
        role.setName(newValue);
      }
    },
    ));
};

const changeInvitationLink = async (channelAnnouncement, interaction) => {
  const pinnedMessages = await channelAnnouncement.messages.fetchPinned();
  const invMessage = pinnedMessages.find(msg => msg.author.id === interaction.applicationId && msg.content.includes("Invitation link for"));
  const courseName = channelAnnouncement.parent.name.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "").trim();

  const updatedMsg = createCourseInvitationLink(courseName);
  await invMessage.edit(updatedMsg);
};

const execute = async (interaction, client, Course) => {
  const choice = interaction.options.getString("options").toLowerCase().trim();
  const newValue = interaction.options.getString("new_value").toLowerCase().trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!channel?.parent?.name?.startsWith("🔒") && !channel?.parent?.name?.startsWith("📚")) {
    return await sendErrorEphemeral(interaction, "This is not a course category, can not execute the command");
  }

  const categoryName = trimCourseName(channel.parent, guild);
  const category = findChannelWithNameAndType(channel.parent.name, "GUILD_CATEGORY", guild);
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_announcement"));

  let databaseValue = await findCourseFromDb(categoryName, Course);

  if (!databaseValue) {
    databaseValue = await createCourseToDatabase("change me", categoryName, categoryName, Course);
    databaseValue = await findCourseFromDb(categoryName, Course);
  }

  const cooldown = checkCourseCooldown(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await sendErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }

  if (choice === "code") {
    if (databaseValue.code === databaseValue.name) {
      const change = await changeCourseNames(newValue, channel, category, guild);
      if (!change) return await sendErrorEphemeral(interaction, "Course name already exists");

      databaseValue.code = newValue;
      databaseValue.name = newValue;
      await databaseValue.save();

      await changeCourseRoles(categoryName, newValue, guild);
      await changeInvitationLink(channelAnnouncement, interaction);

      const newCategoryName = findCategoryName(newValue, guild);
      await setCoursePositionABC(guild, newCategoryName);

    }
    else {
      databaseValue.code = newValue;
      await databaseValue.save();
    }
  }

  if (choice === "name") {
    databaseValue.fullName = newValue;
    await databaseValue.save();
  }

  if (choice === "nick") {
    const change = await changeCourseNames(newValue, channel, category, guild);
    if (!change) return await sendErrorEphemeral(interaction, "Course name already exists");

    databaseValue.name = newValue;
    await databaseValue.save();

    await changeCourseRoles(categoryName, newValue, guild);
    await changeInvitationLink(channelAnnouncement, interaction);

    const newCategoryName = findCategoryName(newValue, guild);
    await setCoursePositionABC(guild, newCategoryName);
  }

  await client.emit("COURSES_CHANGED", Course);
  await updateGuide(client.guild, Course);

  await sendEphemeral(interaction, "Course information has been changed");
  const nameToCoolDown = trimCourseName(channel.parent, guild);
  handleCooldown(nameToCoolDown);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit")
    .setDescription("Edit course code, name or nickname")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("options")
        .setDescription("Edit current course")
        .setRequired(true)
        .addChoice("coursecode", "code")
        .addChoice("full name", "name")
        .addChoice("nickname", "nick"))
    .addStringOption(option =>
      option.setName("new_value")
        .setDescription("Give new value")
        .setRequired(true)),
  execute,
  usage: "/edit [parameter]",
  description: "Edit course code, name or nickname.*",
  roles: ["admin", facultyRole],
};