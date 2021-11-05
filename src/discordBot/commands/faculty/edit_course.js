const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  setCoursePositionABC,
  findCategoryWithCourseName,
  createCourseInvitationLink,
  findChannelWithNameAndType,
  updateGuide,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  getCourseNameFromCategory,
  findCourseFromDb,
  findCourseFromDbWithFullName,
  isCourseCategory,
  editChannelNames } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral, confirmChoice } = require("../../services/message");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const changeCourseNames = async (previousCourseName, newCourseName, channel, courseCategory, guild) => {
  const categoryEmojis = courseCategory.name.replace(getCourseNameFromCategory(courseCategory), "").trim();
  await courseCategory.setName(`${categoryEmojis} ${newCourseName}`);

  const trimmedCourseName = newCourseName.replace(/ /g, "-");

  await Promise.all(guild.channels.cache
    .filter(c => c.parent === channel.parent)
    .map(async ch => {
      const newName = ch.name.replace(previousCourseName, trimmedCourseName);
      await ch.setName(newName);
    },
    ));
  return true;
};


const changeCourseRoles = async (courseName, newValue, guild) => {
  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name === courseName))
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

const changeCourseCode = async (interaction, client, models, courseName, courseCategory, newValue, interactionChannel) => {
  const guild = client.guild;
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === interactionChannel.parent && c.name.includes("_announcement"));

  const databaseValue = await findCourseFromDb(courseName, models.Course);

  if (databaseValue.code === databaseValue.name) {
    if (findChannelWithNameAndType(newValue, "GUILD_CATEGORY", guild) && databaseValue.code.toLowerCase() !== newValue.toLowerCase()) {
      await editErrorEphemeral(interaction, "Course code already exists");
      return false;
    }
    else {
      const previousCourseName = databaseValue.name.replace(/ /g, "-");
      const trimmedNewCourseName = newValue.replace(/ /g, "-");
      await changeCourseNames(previousCourseName, newValue, interactionChannel, courseCategory, guild);

      databaseValue.code = newValue;
      databaseValue.name = newValue;
      await databaseValue.save();

      await changeCourseRoles(courseName, newValue, guild);
      await changeInvitationLink(channelAnnouncement, interaction);

      const newCategory = findCategoryWithCourseName(newValue, guild);
      await setCoursePositionABC(guild, newCategory.name);
      await editChannelNames(databaseValue.id, previousCourseName, trimmedNewCourseName, models.Channel);
      return true;
    }

  }
  databaseValue.code = newValue;
  await databaseValue.save();
  return true;
};

const changeCourseName = async (interaction, models, courseName, newValue) => {
  const databaseValue = await findCourseFromDb(courseName, models.Course);
  if (await findCourseFromDbWithFullName(newValue, models.Course) && databaseValue.fullName.toLowerCase() !== newValue.toLowerCase()) {
    await editErrorEphemeral(interaction, "Course full name already exists");
    return false;
  }
  databaseValue.fullName = newValue;
  await databaseValue.save();
  return true;
};


const changeCourseNick = async (interaction, client, models, courseName, courseCategory, newValue, interactionChannel) => {
  const guild = client.guild;
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === interactionChannel.parent && c.name.includes("_announcement"));
  const databaseValue = await findCourseFromDb(courseName, models.Course);

  if (findChannelWithNameAndType(newValue, "GUILD_CATEGORY", guild) && databaseValue.name.toLowerCase() !== newValue.toLowerCase()) {
    await editErrorEphemeral(interaction, "Course name already exists");
    return false;
  }

  const previousCourseName = databaseValue.name.replace(/ /g, "-");
  await changeCourseNames(previousCourseName, newValue, interactionChannel, courseCategory, guild);
  const trimmedNewCourseName = newValue.replace(/ /g, "-");
  databaseValue.name = newValue;
  await databaseValue.save();
  await changeCourseRoles(courseName, newValue, guild);
  await changeInvitationLink(channelAnnouncement, interaction);
  const newCategory = findCategoryWithCourseName(newValue, guild);
  await setCoursePositionABC(guild, newCategory.name);
  await editChannelNames(databaseValue.id, previousCourseName, trimmedNewCourseName, models.Channel);
  return true;
};

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Editing...");
  const guild = client.guild;
  const interactionChannel = guild.channels.cache.get(interaction.channelId);
  if (!isCourseCategory(interactionChannel.parent)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command");
  }

  const choice = interaction.options.getString("options").toLowerCase().trim();
  const newValue = interaction.options.getString("new_value").trim();

  const confirm = await confirmChoice(interaction, "Change course " + choice + " to: " + newValue);
  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const courseName = getCourseNameFromCategory(interactionChannel.parent, guild);
  const cooldown = checkCourseCooldown(courseName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }

  const courseCategory = findChannelWithNameAndType(getCourseNameFromCategory(interactionChannel.parent), "GUILD_CATEGORY", guild);

  let changeSuccess = false;
  if (choice === "code") {
    changeSuccess = await changeCourseCode(interaction, client, models, courseName, courseCategory, newValue, interactionChannel);
  }

  if (choice === "name") {
    changeSuccess = await changeCourseName(interaction, models, courseName, newValue);
  }

  if (choice === "nick") {
    changeSuccess = await changeCourseNick(interaction, client, models, courseName, courseCategory, newValue, interactionChannel);
  }

  if (changeSuccess) {
    await client.emit("COURSES_CHANGED", models.Course);
    await updateGuide(client.guild, models.Course);
    await editEphemeral(interaction, "Course information has been changed");
    const nameToCoolDown = getCourseNameFromCategory(interactionChannel.parent, guild);
    handleCooldown(nameToCoolDown);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit_course")
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
  usage: "/edit_course [parameter]",
  description: "Edit course code, name or nickname.*",
  roles: ["admin", facultyRole],
};
