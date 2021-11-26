const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  findChannelWithNameAndType,
  msToMinutesAndSeconds,
  handleCooldown,
  checkCourseCooldown,
  getCourseNameFromCategory,
  containsEmojis,
  isCourseCategory } = require("../../services/service");
const {
  findCourseFromDb,
  findCourseFromDbWithFullName } = require("../../../db/services/courseService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { facultyRole } = require("../../../../config.json");

const changeCourseCode = async (interaction, client, models, courseName, newValue) => {
  const guild = client.guild;

  const databaseValue = await findCourseFromDb(courseName, models.Course);
  const trimmedNewCourseName = newValue.replace(/\s/g, "");
  if (databaseValue.code.toLowerCase() === databaseValue.name.toLowerCase()) {
    if (findChannelWithNameAndType(trimmedNewCourseName, "GUILD_CATEGORY", guild) && databaseValue.code.toLowerCase() !== trimmedNewCourseName.toLowerCase()) {
      await editErrorEphemeral(interaction, "Course code already exists");
      return false;
    }
    else {
      databaseValue.code = trimmedNewCourseName;
      databaseValue.name = trimmedNewCourseName.toLowerCase();
      await databaseValue.save();
      return true;
    }

  }
  databaseValue.code = newValue.replace(/\s/g, "");
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


const changeCourseNick = async (interaction, client, models, courseName, newValue) => {
  const guild = client.guild;
  const databaseValue = await findCourseFromDb(courseName, models.Course);

  const trimmedNewCourseName = newValue.replace(/\s/g, "").toLowerCase();

  if (findChannelWithNameAndType(trimmedNewCourseName, "GUILD_CATEGORY", guild) && databaseValue.name.toLowerCase() !== trimmedNewCourseName.toLowerCase()) {
    await editErrorEphemeral(interaction, "Course name already exists");
    return false;
  }

  databaseValue.name = trimmedNewCourseName;
  await databaseValue.save();
  return true;
};

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Editing...");
  const guild = client.guild;
  const interactionChannel = guild.channels.cache.get(interaction.channelId);
  if (!await isCourseCategory(interactionChannel.parent, models.Course)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command");
  }

  const choice = interaction.options.getString("options").toLowerCase().trim();
  const newValue = interaction.options.getString("new_value").trim();

  if (containsEmojis(newValue)) {
    return await editErrorEphemeral(interaction, "Emojis are not allowed!");
  }

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

  let changeSuccess = false;
  if (choice === "code") {
    changeSuccess = await changeCourseCode(interaction, client, models, courseName, newValue);
  }

  if (choice === "name") {
    changeSuccess = await changeCourseName(interaction, models, courseName, newValue);
  }

  if (choice === "nick") {
    changeSuccess = await changeCourseNick(interaction, client, models, courseName, newValue);
  }

  if (changeSuccess) {
    await client.emit("COURSES_CHANGED", models.Course);
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
