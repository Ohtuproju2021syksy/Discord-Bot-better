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
  createCourseToDatabase,
  findCourseFromDbWithFullName,
  isCourseCategory,
  editChannelNames } = require("../../services/service");
const { sendEphemeral, editEphemeral, editErrorEphemeral, confirmChoice } = require("../../services/message");
const { courseAdminRole, facultyRole } = require("../../../../config.json");


const changeCourseNames = async (previousCourseName, newCourseName, channel, category, guild) => {
  if (guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && getCourseNameFromCategory(c.name.toLowerCase()) === newCourseName.toLowerCase())) return;
  const categoryEmojis = category.name.replace(getCourseNameFromCategory(category), "").trim();
  await category.setName(`${categoryEmojis} ${newCourseName}`);
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

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Editing...");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);
  if (!isCourseCategory(channel.parent)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command");
  }

  const choice = interaction.options.getString("options").toLowerCase().trim();
  const newValue = interaction.options.getString("new_value").trim();


  const confirm = await confirmChoice(interaction, "Change course " + choice + " to: " + newValue);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }
  const categoryName = getCourseNameFromCategory(channel.parent, guild);
  const cooldown = checkCourseCooldown(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return await editErrorEphemeral(interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }
  const category = findChannelWithNameAndType(getCourseNameFromCategory(channel.parent), "GUILD_CATEGORY", guild);
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_announcement"));

  let databaseValue = await findCourseFromDb(categoryName, models.Course);

  if (!databaseValue) {
    databaseValue = await createCourseToDatabase("change me", categoryName, categoryName, models.Course);
    databaseValue = await findCourseFromDb(categoryName, models.Course);
  }

  const previousCourseName = databaseValue.name.replace(/ /g, "-");
  const trimmedNewCourseName = newValue.replace(/ /g, "-");
  if (choice === "code") {

    if (databaseValue.code === databaseValue.name) {
      const change = await changeCourseNames(previousCourseName, newValue, channel, category, guild);
      if (!change) return await editErrorEphemeral(interaction, "Course code already exists");

      databaseValue.code = newValue;
      databaseValue.name = newValue;
      await databaseValue.save();

      await changeCourseRoles(categoryName, newValue, guild);
      await changeInvitationLink(channelAnnouncement, interaction);

      const newCategory = findCategoryWithCourseName(newValue, guild);
      await setCoursePositionABC(guild, newCategory.name);

    }
    else {
      databaseValue.code = newValue;
      await databaseValue.save();
    }
  }

  if (choice === "name") {

    if (await findCourseFromDbWithFullName(newValue, models.Course)) return await editErrorEphemeral(interaction, "Course full name already exists");
    databaseValue.fullName = newValue;
    await databaseValue.save();
  }

  if (choice === "nick") {
    const change = await changeCourseNames(previousCourseName, newValue, channel, category, guild);
    if (!change) return await editErrorEphemeral(interaction, "Course name already exists");

    databaseValue.name = newValue;
    await databaseValue.save();

    await changeCourseRoles(categoryName, newValue, guild);
    await changeInvitationLink(channelAnnouncement, interaction);

    const newCategory = findCategoryWithCourseName(newValue, guild);
    await setCoursePositionABC(guild, newCategory.name);
  }

  await editChannelNames(databaseValue.id, previousCourseName, trimmedNewCourseName, models.Channel);
  await client.emit("COURSES_CHANGED", models.Course);
  await updateGuide(client.guild, models.Course);

  await editEphemeral(interaction, "Course information has been changed");
  const nameToCoolDown = getCourseNameFromCategory(channel.parent, guild);
  handleCooldown(nameToCoolDown);
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
